import express from "express";
import {
  accessChats,
  fetchAllChats,
  createGroup,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../controllers/Chat";
import { Server } from "socket.io";
import { Auth } from "../middleware/auth";

const router = express.Router();

const createChatRoutes = (io: Server) => {
  router.post("/access", Auth, accessChats);
  router.get("/", Auth, fetchAllChats);
  router.post("/create", Auth, createGroup(io));
  router.put("/rename", Auth, renameGroup(io));
  router.put("/add", Auth, addToGroup(io));
  router.put("/remove", Auth, removeFromGroup(io));

  return router;
};

export default createChatRoutes;
