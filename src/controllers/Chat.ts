import { Request, Response } from "express";
import Chat, { IChat } from "../models/Chat";
import { IUser } from "../models/User";
import { Server } from "socket.io";

export const accessChats = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const { page = 1, limit = 10 } = req.query;

  try {
    const chats = await Chat.find({ users: userId })
      .populate("users", "name email")
      .populate("latestMessage", "message createdAt")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    chats.forEach((chat) => {
      chat.chatNames = {};
      (chat.users as IUser[]).forEach((user) => {
        chat.chatNames[user._id.toString()] = user.name;
      });
    });

    const totalChats = await Chat.countDocuments({ users: userId });
    const totalPages = Math.ceil(totalChats / Number(limit));

    res.status(200).json({
      chats,
      totalPages,
      currentPage: Number(page),
      totalChats,
    });
  } catch (error) {
    console.error("Error accessing chats:", error);
    res.status(500).json({ error: "Error accessing chats" });
  }
};

export const fetchAllChats = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const chats = await Chat.find()
      .populate("users", "name email")
      .populate("latestMessage", "message createdAt")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalChats = await Chat.countDocuments();
    const totalPages = Math.ceil(totalChats / Number(limit));

    res.status(200).json({
      chats,
      totalPages,
      currentPage: Number(page),
      totalChats,
    });
  } catch (error) {
    console.error("Error fetching all chats:", error);
    res.status(500).json({ error: "Error fetching all chats" });
  }
};

export const createGroup =
  (io: Server) => async (req: Request, res: Response) => {
    const { chatName, userIds, groupAdminId } = req.body;
    try {
      const groupChat = await Chat.create({
        chatName,
        isGroup: true,
        users: userIds,
        groupAdmin: groupAdminId,
      });
      userIds.forEach((userId: string) => {
        io.to(userId).emit("newGroupChat", groupChat);
      });

      res.status(201).json(groupChat);
    } catch (error) {
      console.error("Error creating group chat:", error);
      res.status(500).json({ error: "Error creating group chat" });
    }
  };

export const renameGroup =
  (io: Server) => async (req: Request, res: Response) => {
    const { chatId, newChatName } = req.body;

    try {
      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName: newChatName },
        { new: true }
      );

      io.to(chatId).emit("groupChatRenamed", {
        message: `Group renamed to ${newChatName}`,
        chat: updatedChat,
      });

      res.status(200).json(updatedChat);
    } catch (error) {
      console.error("Error renaming group chat:", error);
      res.status(500).json({ error: "Error renaming group chat" });
    }
  };

export const addToGroup =
  (io: Server) => async (req: Request, res: Response) => {
    const { chatId, userId } = req.body;

    try {
      const chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      if (chat.users.includes(userId)) {
        return res.status(400).json({ error: "User is already in the group" });
      }

      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
      );

      io.to(userId).emit("addedToGroup", updatedChat);
      io.to(chatId).emit("userAddedToGroup", {
        message: `User ${userId} added to group`,
        chat: updatedChat,
      });

      res.status(200).json(updatedChat);
    } catch (error) {
      console.error("Error adding user to group chat:", error);
      res.status(500).json({ error: "Error adding user to group chat" });
    }
  };

export const removeFromGroup =
  (io: Server) => async (req: Request, res: Response) => {
    const { chatId, userId } = req.body;

    try {
      const chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      if (!chat.users.includes(userId)) {
        return res.status(200).json({ message: "User is not in the group" });
      }

      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
      );

      io.to(userId).emit("removedFromGroup", updatedChat);
      io.to(chatId).emit("userRemovedFromGroup", {
        message: `User ${userId} removed from group`,
        chat: updatedChat,
      });

      res.status(200).json(updatedChat);
    } catch (error) {
      console.error("Error removing user from group chat:", error);
      res.status(500).json({ error: "Error removing user from group chat" });
    }
  };
