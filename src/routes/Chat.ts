import { Router } from "express";
import { Auth } from "../middleware/auth";
import {
  accessChats,
  fetchAllChats,
  createGroup,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../controllers/Chat";

const router = Router();

export default (io: any) => {
  router.post("/access", Auth, accessChats);
  router.get("/all", Auth, fetchAllChats);
  router.post("/create-group", Auth, createGroup(io));
  router.put("/rename-group", Auth, renameGroup(io));
  router.put("/add-to-group", Auth, addToGroup(io));
  router.put("/remove-from-group", Auth, removeFromGroup(io));

  return router;
};
