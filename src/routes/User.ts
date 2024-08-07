import express from "express";
import {
  register,
  login,
  validUser,
  logout,
  googleAuth,
  searchUsers,
  getUserById,
  updateInfo,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
} from "../controllers/User";
import { Auth } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/valid-user", Auth, validUser);
router.get("/logout", Auth, logout);
router.post("/google-auth", googleAuth);
router.get("/search", Auth, searchUsers);
router.get("/user/:userId", Auth, getUserById);
router.put("/update-info", Auth, updateInfo);
router.post("/send-friend-request", Auth, sendFriendRequest);
router.get("/friend-requests", Auth, getFriendRequests);
router.post("/accept-friend-request", Auth, acceptFriendRequest);
router.post("/reject-friend-request", Auth, rejectFriendRequest);
router.post("/remove-friend", Auth, removeFriend);
router.post("/block-user", Auth, blockUser);
router.post("/unblock-user", Auth, unblockUser);

export default router;
