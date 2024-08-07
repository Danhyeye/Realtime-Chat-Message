import { Request, Response } from "express";
import Message from "../models/Message";
import Chat, { IChat } from "../models/Chat";
import { Server } from "socket.io";

export const sendMessage =
  (io: Server) => async (req: Request, res: Response) => {
    const { chatId, senderId, message } = req.body;

    if (!chatId || !senderId || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const newMessage = new Message({
        chat: chatId,
        sender: senderId,
        message,
      });

      const savedMessage = await newMessage.save();
      const populatedMessage = await savedMessage.populate(
        "sender",
        "name profilePic"
      );

      await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage });

      io.to(chatId).emit("message", populatedMessage);

      res.status(201).json(populatedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Error sending message" });
    }
  };

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sender", "name profilePic");

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Error fetching messages" });
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

      const chat = updatedMessage.chat as unknown as IChat;
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
