import express from "express";
import { getUserChats, getOrCreateChatMessages } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/chats", getUserChats);
router.get("/messages", getOrCreateChatMessages);

export default router;