import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Chat } from "../models/Chat.js";
import { UserChat } from "../models/Chat.js";
import { Message } from "../models/Message.js";

export const getUserChats = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    const userChats = await UserChat.find({ user_id });

    const allPartnersArrays = await Promise.all(
      userChats.map(async (userChat) => {
        const partners = await UserChat.find({
          chat_id: userChat.chat_id,
          user_id: { $ne: user_id },
        });

        const partnersWithInfo = await Promise.all(
          partners.map(async (partner) => {
            const user = await User.findById(partner.user_id).select("firstname surname avatar_url");
            return {
              receiver_id: user._id,
              firstname: user?.firstname || "Unknown",
              surname: user?.surname || "Unknown",
              avatar_url: user?.avatar_url || "",
            };
          })
        );
        return partnersWithInfo;
      })
    );

    const allPartners = allPartnersArrays.flat();

    const uniquePartners = [];
    const seen = new Set();
    for (const partner of allPartners) {
      const idStr = partner.receiver_id.toString();
      if (!seen.has(idStr)) {
        seen.add(idStr);
        uniquePartners.push(partner);
      }
    }

    res.json({ chats: uniquePartners });
  } catch (error) {
    console.error("Ошибка:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getOrCreateChatMessages = async (req, res) => {
  const { sender_id, receiver_id } = req.query;

  if (!sender_id || !receiver_id) {
    return res.status(400).json({ error: "Необходимо передать оба идентификатора пользователей." });
  }

  try {
    const senderObjectId = new mongoose.Types.ObjectId(sender_id);
    const receiverObjectId = new mongoose.Types.ObjectId(receiver_id);

    const chats = await UserChat.aggregate([
      {
        $match: {
          user_id: { $in: [senderObjectId, receiverObjectId] },
        },
      },
      {
        $group: {
          _id: "$chat_id",
          userIds: { $addToSet: "$user_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: 2,
          userIds: { $all: [senderObjectId, receiverObjectId] },
        },
      },
    ]);

    let chatId;
    if (chats.length === 0) {
      const newChat = new Chat({ is_direct: true });
      await newChat.save();
      chatId = newChat._id;

      const userChat1 = new UserChat({ user_id: senderObjectId, chat_id: chatId });
      const userChat2 = new UserChat({ user_id: receiverObjectId, chat_id: chatId });
      await Promise.all([userChat1.save(), userChat2.save()]);

      return res.json({ chatId, messages: [] });
    } else {
      chatId = chats[0]._id;
    }

    const messages = await Message.find({ chat_id: chatId })
      .sort({ created_at: 1 })
      .populate({ path: "user_id", select: "firstname" });

    const messagesWithUsername = messages.map((message) => ({
      _id: message._id,
      user_id: message.user_id._id,
      username: message.user_id.firstname,
      chat_id: message.chat_id,
      content: message.content,
      created_at: message.created_at,
      updated_at: message.updated_at,
    }));

    return res.json({ chatId, messages: messagesWithUsername });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
};
