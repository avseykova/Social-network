import express from "express";
import { getFeed } from "../controllers/feed.controller.js";

const router = express.Router();

router.post("/feed", getFeed);

export default router;
