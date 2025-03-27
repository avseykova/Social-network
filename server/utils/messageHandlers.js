// utils/messageHandlers.js
import mongoose from "mongoose";
import { Message } from "../models/Message.js";
import { Chat } from "../models/Chat.js";

export const saveMessage = async (message) => {
  const { user_id, chat_id, content } = message;

  if (!user_id || !chat_id || !content) {
    console.log("Параметры user_id, chat_id и content обязательны.");
    return null;
  }

  try {
    const chat = await Chat.findById(chat_id);
    if (!chat) {
      console.log("Чат не найден.");
      return null;
    }

    const newMessage = new Message({
      user_id: new mongoose.Types.ObjectId(user_id),
      chat_id: new mongoose.Types.ObjectId(chat_id),
      content,
    });

    const savedMessage = await newMessage.save();
    return savedMessage;
  } catch (error) {
    console.error("Ошибка при сохранении сообщения:", error);
    return null;
  }
};

export const updateMessage = async (message) => {
  const { content, _id } = message;

  if (!content || !_id) {
    console.log("Параметры _id, content обязательны.");
    return null;
  }

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      _id,
      { content, updated_at: Date.now() },
      { new: true }
    );

    if (!updatedMessage) {
      console.log("Сообщение не найдено.");
      return null;
    }

    return updatedMessage;
  } catch (error) {
    console.error("Ошибка при обновлении сообщения:", error);
    return null;
  }
};

export const messageDelete = async (messageId) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return { error: "Сообщение не найдено" };
    }

    console.log("Сообщение удалено");
    return deletedMessage;
  } catch (error) {
    console.error("Ошибка при удалении сообщения:", error);
  }
};
