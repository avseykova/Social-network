import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String,unique: true, required: true },
  firstname: { type: String},
  surname: { type: String},
  email: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  avatar_url: { type: String, default: "" },
  followers: { type: [String], default: [] },
  bio: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
