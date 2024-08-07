import { Router } from "express";
import { Auth } from "../middleware/auth";
import {
  sendMessage,
  getMessages,
  deleteMessage,
  updateMessage,
  reactMessage,
} from "../controllers/Message";

const router = Router();

export default (io: any) => {
  router.post("/send", Auth, sendMessage(io));
  router.get("/:chatId", Auth, getMessages);
  router.delete("/delete", Auth, deleteMessage(io));
  router.put("/update", Auth, updateMessage(io));
  router.put("/react", Auth, reactMessage(io));

  return router;
};
