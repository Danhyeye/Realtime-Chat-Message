import express from "express";
import { Server } from "socket.io";
import {
  getMessages,
  sendMessage,
  deleteMessage,
  updateMessage,
} from "../controllers/Message";
import { Auth } from "../middleware/auth";

const router = express.Router();

export default (io: Server) => {
  router.post("/send", Auth, sendMessage(io));
  router.get("/:chatId", Auth, getMessages);
  router.delete("/delete", Auth, deleteMessage(io));
  router.put("/update", Auth, updateMessage(io));

  return router;
};
