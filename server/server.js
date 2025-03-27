import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import postRoutes from "./routes/post.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import profileRoutes from "./routes/profile.routes.js";

import setupChatSocket from "./sockets/chatSocket.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const corsData = {
  origin: "http://localhost:5174",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};

app.use(cors(corsData));
app.use(express.json());
app.use("/uploads", express.static("uploads"));


app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", chatRoutes);
app.use("/api", postRoutes);
app.use("/api", feedRoutes);
app.use("/api", profileRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: corsData });
app.set("io", io);

setupChatSocket(io);

httpServer.listen(PORT, () => console.log("Server started on port", PORT));
