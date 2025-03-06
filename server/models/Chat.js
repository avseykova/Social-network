import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  is_direct: { type: Boolean, default: false },
  name: { type: String, default: "default_chat"},
  avatar_url: { type: String, default: "./uploads/default_avatar.png" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const userChatSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
});

export const UserChat = mongoose.model("UserChat", userChatSchema);
export const Chat = mongoose.model("Chat", chatSchema);
