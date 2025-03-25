import { User } from "../models/User.js";

export const getUserInfo = async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await User.findById(user_id);
    if (!user) return res.status(400).json({ error: "User not found" });

    const subscriptions = await User.find({ followers: user_id }, "firstname surname avatar_url");

    res.status(200).json({
      firstname: user.firstname,
      surname: user.surname,
      email: user.email,
      avatarUrl: user.avatar_url,
      subscriptions,
      followers: user.followers,
      followersCount: user.followers.length,
      subscriptionsCount: subscriptions.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { user_id, firstname, surname, avatarUrl } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { firstname, surname, avatar_url: avatarUrl, updated_at: Date.now() },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated" });
  } catch (error) {
    console.error("Profile update error", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = await User.findById(userId);

    if (!page) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!page.followers || page.followers.length === 0) {
      return res.json({ followers: [] });
    }

    const followers = await User.find(
      { _id: { $in: page.followers } },
      "firstname surname email avatar_url followers"
    );

    res.json({ followers });
  } catch (error) {
    console.error("Subscribers retrieving error", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subscriptions = await User.find({ followers: userId }, "firstname surname email avatar_url followers");

    res.json({ subscriptions });
  } catch (error) {
    console.error("Subscribe Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleSubscribe = async (req, res) => {
  try {
    const { userId, pageId } = req.body;
    const user = await User.findById(pageId);

    if (!user) {
      return res.status(404).json({ message: "Page not found" });
    }

    const index = user.followers.indexOf(userId);

    if (index === -1) {
      user.followers.push(userId);
    } else {
      user.followers.splice(index, 1);
    }

    await user.save();

    const subscriptions = await User.find({ followers: pageId }, "firstname surname avatar_url");

    res.json({ followers: user.followers, subscriptions });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.json({ users });
    } catch (err) {
      res.status(500).json({ message: "Posts retrieving errror" });
    }
  };

export const toggleUnsubscribe = toggleSubscribe;
