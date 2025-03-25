import { Post } from "../models/Post.js";
import { User } from "../models/User.js";

export const createPost = async (req, res) => {
  try {
    const { user_id, content, image_url } = req.body;
    const newPost = new Post({ user_id, content, image_url });
    await newPost.save();

    const populatedPost = await Post.findById(newPost._id).populate("user_id", "firstname surname");
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при создании поста" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user_id: req.params.userId })
      .populate("user_id", "firstname surname avatar_url")
      .sort({ created_at: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Ошибка при получении постов пользователя:", error);
    res.status(500).json({ error: "Ошибка при получении постов пользователя" });
  }
};

export const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: "Пост удалён" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при удалении поста" });
  }
};

export const likePost = async (req, res) => {
  try {
    const { user_id, postId } = req.body;
    const post = await Post.findById(postId).populate("user_id", "firstname surname avatar_url");
    if (!post) return res.status(404).json({ message: "Пост не найден" });

    const likeIndex = post.likes.indexOf(user_id);
    if (likeIndex === -1) {
      post.likes.push(user_id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    const io = req.app.get("io");
    io.to(post.user_id._id.toString()).emit("postUpdate", post);

    res.json(post);
  } catch (error) {
    console.error("Ошибка при лайке поста:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
