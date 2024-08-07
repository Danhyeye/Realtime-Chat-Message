import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Chat from "../models/Chat";
import { AuthRequest } from "../middleware/authRequest";
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

    res.status(200).json({
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

export const validUser = async (req: AuthRequest, res: Response) => {
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

export const searchUsers = async (req: AuthRequest, res: Response) => {
  const { query } = req.query;
  const { userId } = req.user!;

  try {
    const users = await User.find({
      $or: [{ email: { $regex: query, $options: "i" } }],
      _id: { $ne: userId },
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

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;
  const { recipientId } = req.body;

  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    if (
      recipient.friendRequests.includes(userId as any) ||
      recipient.friends.includes(userId as any)
    ) {
      return res
        .status(400)
        .json({ error: "Friend request already sent or already friends" });
    }

    recipient.friendRequests.push(userId as any);
    await recipient.save();

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;

  try {
    const user = await User.findById(userId).populate(
      "friendRequests",
      "name email profilePic"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.friendRequests);
  } catch (error) {
    console.error("Error retrieving friend requests:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;
  const { requesterId } = req.body;

  try {
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.friendRequests.includes(requesterId as any)) {
      return res.status(400).json({ error: "Friend request not found" });
    }

    user.friends.push(requesterId as any);
    requester.friends.push(userId as any);

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== requesterId
    );
    await user.save();
    await requester.save();

    // Check if chat exists
    let chat = await Chat.findOne({
      isGroup: false,
      users: { $all: [userId, requesterId] },
    });

    // Create chat if it does not exist
    if (!chat) {
      chat = new Chat({
        chatNames: new Map([
          [userId.toString(), requester.name],
          [requesterId.toString(), user.name],
        ]),
        isGroup: false,
        users: [userId, requesterId],
      });
      await chat.save();
    }

    res.status(200).json({ message: "Friend request accepted", chat });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const rejectFriendRequest = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;
  const { requesterId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.friendRequests.includes(requesterId as any)) {
      return res.status(400).json({ error: "Friend request not found" });
    }

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== requesterId
    );
    await user.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const removeFriend = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;
  const { friendId } = req.body;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: "User not found" });
    }

    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const blockUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;
  const { blockedUserId } = req.body;

  try {
    const user = await User.findById(userId);
    const blockedUser = await User.findById(blockedUserId);

    if (!user || !blockedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.blockedUsers.includes(blockedUserId as any)) {
      return res.status(400).json({ error: "User already blocked" });
    }

    user.blockedUsers.push(blockedUserId as any);
    await user.save();

    res.status(200).json({ message: "User blocked" });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const unblockUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;
  const { blockedUserId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.blockedUsers.includes(blockedUserId as any)) {
      return res.status(400).json({ error: "User not blocked" });
    }

    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== blockedUserId
    );
    await user.save();

    res.status(200).json({ message: "User unblocked" });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ error: "Server error" });
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

export const getFriends = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate(
      "friends",
      "name email profilePic"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Error fetching friends" });
  }
};
