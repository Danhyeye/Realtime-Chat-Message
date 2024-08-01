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
router.get("/valid", Auth, validUser);
router.post("/logout", Auth, logout);
router.post("/google-auth", googleAuth);
router.post("/search", Auth, searchUsers);
router.get("/:id", Auth, getUserById);
router.put("/update", Auth, updateInfo);
router.post("/friend-request", Auth, sendFriendRequest);
router.post("/accept-friend", Auth, acceptFriendRequest);
router.post("/reject-friend", Auth, rejectFriendRequest);
router.post("/remove-friend", Auth, removeFriend);
router.post("/block-user", Auth, blockUser);
router.post("/unblock-user", Auth, unblockUser);

export default router;
