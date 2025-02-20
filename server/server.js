import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import profileRoutes from "./profileRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.use(
  cors({
    origin: "http://localhost:5174",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/profile", profileRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email is already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password_hash: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    res
      .status(201)
      .json({ message: "Login successful", username: user.username });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/user-info", async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    res.status(200).json({
      username: user.username,
      email: user.email,
      avatarUrl: user.avatar_url,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/updateuser", async (req, res) => {
  try {
    const { username, avatarUrl } = req.body;

    if (!username || !avatarUrl) {
      return res
        .status(400)
        .json({ error: "userName и avatarUrl обязательны" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { username },
      { avatar_url: avatarUrl, updated_at: Date.now() },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json({ message: "Аватар обновлен" });
  } catch (error) {
    console.error("Ошибка при обновлении аватара:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

const start = () => {
  try {
    app.listen(PORT, () => console.log("Server started on port", PORT));
  } catch (e) {
    console.log(e);
  }
};

start();
