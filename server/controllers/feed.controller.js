import { User } from "../models/User.js";
import { Post } from "../models/Post.js";

export const getFeed = async (req, res) => {
  try {
    const { userId, page = 1, limit = 5 } = req.body;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const subscribers = await User.find({ followers: userId }, "_id");
    if (!subscribers.length) {
      return res.json({ message: "No posts in the feed", posts: [], totalPages: 0 });
    }

    const subscriberIds = subscribers.map((user) => user._id);

    const totalPosts = await Post.countDocuments({ user_id: { $in: subscriberIds } });
    const posts = await Post.find({ user_id: { $in: subscriberIds } })
      .populate("user_id", "username firstname surname avatar_url")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      hasMore: page * limit < totalPosts,
    });
  } catch (error) {
    console.error("Feed loading error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
