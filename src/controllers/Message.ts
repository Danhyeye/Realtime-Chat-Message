import { Request, Response } from "express";
import Message from "../models/Message";
import Chat, { IChat } from "../models/Chat";
import { Server } from "socket.io";
import { IUser } from "../models/User";

export const sendMessage =
  (io: Server) => async (req: Request, res: Response) => {
    const { message, senderId, chatId } = req.body;

    try {
      const chatMessage = await Message.create({
        message,
        sender: senderId,
        chat: chatId,
      });
      await Chat.findByIdAndUpdate(chatId, { latestMessage: chatMessage._id });

      const chat = await Chat.findById(chatId).populate("users", "name email");
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      const users = chat.users as IUser[];

      users.forEach((user) => {
        const userId = user._id.toString();
        if (userId !== senderId) {
          io.to(userId).emit("notification", {
            notificationMessage: `You have a new message in chat ${chat.chatName}`,
            chatId,
            message: chatMessage.message,
            senderId,
          });
        }
      });

      io.to(chatId).emit("message", chatMessage);
      res.status(201).json(chatMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Error sending message" });
    }
  };

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10
  try {
    const messages = await Message.find({ chat: chatId })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalMessages = await Message.countDocuments({ chat: chatId });
    const totalPages = Math.ceil(totalMessages / Number(limit));

    res.status(200).json({
      messages,
      totalPages,
      currentPage: Number(page),
      totalMessages,
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ error: "Error retrieving messages" });
  }
};

export const deleteMessage =
  (io: Server) => async (req: Request, res: Response) => {
    const { messageId, chatId } = req.body;
    try {
      await Message.findByIdAndDelete(messageId);
      io.to(chatId).emit("messageDeleted", { messageId });

      res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ error: "Error deleting message" });
    }
  };

export const updateMessage =
  (io: Server) => async (req: Request, res: Response) => {
    const { messageId, newMessage } = req.body;
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { message: newMessage },
        { new: true }
      ).populate<{ chat: IChat }>("chat");

      if (!updatedMessage) {
        return res.status(404).json({ error: "Message not found" });
      }

      const chat = updatedMessage.chat;
      if (!chat) {
        return res
          .status(500)
          .json({ error: "Message does not belong to any chat" });
      }

      io.to(chat._id.toString()).emit("messageUpdated", updatedMessage);

      res.status(200).json(updatedMessage);
    } catch (error) {
      console.error("Error updating message:", error);
      res.status(500).json({ error: "Error updating message" });
    }
  };

export const reactMessage =
  (io: Server) => async (req: Request, res: Response) => {
    const { messageId, userId, type } = req.body;

    try {
      const message = await Message.findById(messageId);

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      const existingReaction = message.reactions.find(
        (reaction) =>
          reaction.userId.toString() === userId && reaction.type === type
      );

      if (existingReaction) {
        message.reactions = message.reactions.filter(
          (reaction) =>
            !(reaction.userId.toString() === userId && reaction.type === type)
        );
      } else {
        message.reactions.push({ userId, type });
      }

      await message.save();

      io.to(message.chat.toString()).emit("messageReacted", message);

      res.status(200).json(message);
    } catch (error) {
      console.error("Error reacting to message:", error);
      res.status(500).json({ error: "Error reacting to message" });
    }
  };
