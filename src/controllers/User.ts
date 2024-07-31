import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { Server } from "socket.io";

export const register = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = new User({
      name,
      email,
      phone,
      password,
      bio: "Available",
      profilePic:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res
      .status(200)
      .json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          bio: user.bio,
          profilePic: user.profilePic,
        },
      });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const validUser = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    res.status(200).json(decoded);
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Logged out successfully" });
};

export const googleAuth = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Google authentication placeholder" });
};

export const searchUsers = async (req: Request, res: Response) => {
  const { query } = req.body;
  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("id name email profilePic");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Error searching users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("id name email bio profilePic");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ error: "Error retrieving user" });
  }
};

export const updateInfo = async (req: Request, res: Response) => {
  const { id, name, bio, profilePic } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, bio, profilePic },
      { new: true }
    ).select("id name bio profilePic");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user information:", error);
    res.status(500).json({ error: "Error updating user information" });
  }
};

export const sendFriendRequest = async (req: Request, res: Response) => {
  const { userId, friendId } = req.body;
  try {
    await User.findByIdAndUpdate(
      userId,
      { $push: { friendRequests: friendId } },
      { new: true }
    );
    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Error sending friend request" });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  const { userId, friendId } = req.body;
  try {
    await User.findByIdAndUpdate(
      userId,
      { $push: { friends: friendId }, $pull: { friendRequests: friendId } },
      { new: true }
    );
    await User.findByIdAndUpdate(
      friendId,
      { $push: { friends: userId } },
      { new: true }
    );
    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Error accepting friend request" });
  }
};

export const updateUserStatus =
  (io: Server) => async (userId: string, status: string) => {
    try {
      await User.findByIdAndUpdate(userId, { status });
      io.emit("userStatusUpdated", { userId, status });
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

export const handleSocketConnection = (io: Server) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
    updateUserStatus(io)(userId, "online");

    socket.on("disconnect", () => {
      updateUserStatus(io)(userId, "offline");
    });
  });
};
