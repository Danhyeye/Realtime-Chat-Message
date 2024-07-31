import { Request, Response } from "express";
import Chat from "../models/Chat";
import { Server } from "socket.io";

export const accessChats = async (req: Request, res: Response) => {
  const { userId } = req.body;
  try {
    const chats = await Chat.find({ users: userId })
      .populate("users", "name email")
      .populate("latestMessage", "message createdAt");
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error accessing chats:", error);
    res.status(500).json({ error: "Error accessing chats" });
  }
};

export const fetchAllChats = async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find()
      .populate("users", "name email")
      .populate("latestMessage", "message createdAt");
    res.status(200).json(chats);
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
      io.to(chatId).emit("groupChatRenamed", updatedChat);

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
      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
      );
      io.to(userId).emit("addedToGroup", updatedChat);
      io.to(chatId).emit("userAddedToGroup", updatedChat);

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
      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
      );
      io.to(userId).emit("removedFromGroup", updatedChat);
      io.to(chatId).emit("userRemovedFromGroup", updatedChat);

      res.status(200).json(updatedChat);
    } catch (error) {
      console.error("Error removing user from group chat:", error);
      res.status(500).json({ error: "Error removing user from group chat" });
    }
  };
