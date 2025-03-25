import express from "express";
import {
  createPost,
  getUserPosts,
  deletePost,
  likePost
} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/posts", createPost);
router.get("/posts/:userId", getUserPosts);
router.delete("/posts/:postId", deletePost);
router.put("/posts/like", likePost);

export default router;