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
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json({ message: "Профиль обновлён" });
  } catch (error) {
    console.error("Ошибка при обновлении профиля:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = await User.findById(userId);

    if (!page) {
      return res.status(404).json({ message: "Пользователь не найден" });
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
    console.error("Ошибка при получении подписчиков:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const subscriptions = await User.find({ followers: userId }, "firstname surname email avatar_url followers");

    res.json({ subscriptions });
  } catch (error) {
    console.error("Ошибка при подписке:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const toggleSubscribe = async (req, res) => {
  try {
    const { userId, pageId } = req.body;
    const user = await User.findById(pageId);

    if (!user) {
      return res.status(404).json({ message: "Страница не найдена" });
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
    console.error("Ошибка при подписке:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getAllUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.json({ users });
    } catch (err) {
      res.status(500).json({ message: "Ошибка при получении пользователей" });
    }
  };

export const toggleUnsubscribe = toggleSubscribe;
