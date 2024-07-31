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

export default router;
