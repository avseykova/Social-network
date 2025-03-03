import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "./models/User.js";
import { Message } from "./models/Message.js";
import { UserChat, Chat } from "./models/Chat.js";
import profileRoutes from "./profileRoutes.js";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { Post } from "./models/Posts.js";

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
app.use("", profileRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, { cors: corsData });

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on("chatMessage", async (message) => {
    await saveMessage(message);

    try {
      const user = await User.findById(message.user_id);
      if (user) {
        message.username = user.username;
      } else {
        message.username = "Неизвестный пользователь";
      }
    } catch (error) {
      console.error("Ошибка при получении пользователя:", error);
      message.username = "Ошибка";
    }

    io.to(message.chat_id).emit("chatMessage", message);
    console.log(`Message in room ${message.chat_id} from ${message.username}`);
  });


  




  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});



app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении пользователей" });
  }
});

app.post("/chats", async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    const userChats = await UserChat.find({ user_id: user_id });

    const allPartnersArrays = await Promise.all(
      userChats.map(async (userChat) => {
        const partners = await UserChat.find({
          chat_id: userChat.chat_id,
          user_id: { $ne: user_id },
        });

        const partnersWithInfo = await Promise.all(
          partners.map(async (partner) => {
            const user = await User.findById(partner.user_id).select(
              "firstname surname avatar_url"
            );
            return {
              receiver_id: user._id,
              firstname: user ? user.firstname : "Unknown",
              surname: user ? user.surname : "Unknown",
              avatar_url: user ? user.avatar_url : "",
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
});

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ username });
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
      .json({
        message: "Login successful",
        user_id: user.id,
        email: user.email,
      });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/user-info", async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await User.findById(user_id);
    if (!user) return res.status(400).json({ error: "User not found" });

    res.status(200).json({
      firstname: user.firstname,
      surname: user.surname,
      email: user.email,
      avatarUrl: user.avatar_url,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/updateuser", async (req, res) => {
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

    res.json({ message: "Аватар обновлен" });
  } catch (error) {
    console.error("Ошибка при обновлении аватара:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});



app.get("/api/messages", async (req, res) => {
  const { sender_id, receiver_id } = req.query;

  if (!sender_id || !receiver_id) {
    return res
      .status(400)
      .json({ error: "Необходимо передать оба идентификатора пользователей." });
  }

  try {
    const senderObjectId = new mongoose.Types.ObjectId(sender_id);
    const receiverObjectId2 = new mongoose.Types.ObjectId(receiver_id);
    const chats = await UserChat.aggregate([
      {
        $match: {
          user_id: { $in: [senderObjectId, receiverObjectId2] },
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
          userIds: { $all: [senderObjectId, receiverObjectId2] },
        },
      },
    ]);

    let directChats = [];
    if (chats.length > 0) {
      const chatIds = chats.map((c) => c._id);

      directChats = await Chat.find({
        _id: { $in: chatIds },
        is_direct: true,
      });
    }

    let chatId;

    if (directChats.length === 0) {
      const newChat = new Chat({ is_direct: true });
      await newChat.save();
      chatId = newChat._id;

      const userChat1 = new UserChat({
        user_id: senderObjectId,
        chat_id: chatId,
      });
      const userChat2 = new UserChat({
        user_id: receiverObjectId2,
        chat_id: chatId,
      });
      await Promise.all([userChat1.save(), userChat2.save()]);

      return res.json({ chatId, messages: [] });
    } else {
      chatId = directChats[0]._id;
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
});



const saveMessage = async (message) => {
  const { user_id, chat_id, content } = message;

  if (!user_id || !chat_id || !content) {
    console.log("Параметры user_id, chat_id и content обязательны.");
    return;
  }

  try {
    const chat = await Chat.findById(chat_id);
    if (!chat) {
      console.log("Чат не найден.");
      return;
    }

    const newMessage = new Message({
      user_id: new mongoose.Types.ObjectId(user_id),
      chat_id: new mongoose.Types.ObjectId(chat_id),
      content,
    });

    await newMessage.save();
  } catch (error) {
    console.error(error);
  }
};


  


app.put('/api/messages/:messageId', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.messageId,
      { content, updated_at: Date.now() },
      { new: true }
    ).populate('user_id', 'username'); // Загружаем username пользователя

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }

    // Создаём новый объект сообщения, добавляя username
    const messageWithUsername = {
      _id: updatedMessage._id,
      chat_id: updatedMessage.chat_id,
      user_id: updatedMessage.user_id._id,
      username: updatedMessage.user_id?.username || 'Неизвестный пользователь', // Добавляем username
      content: updatedMessage.content,
      created_at: updatedMessage.created_at,
      updated_at: updatedMessage.updated_at
    };

    console.log('Обновленный username:', messageWithUsername.username);

    // Отправляем обновлённое сообщение через WebSocket
    io.to(updatedMessage.chat_id.toString()).emit('messageUpdated', messageWithUsername);

    res.json(messageWithUsername);
  } catch (error) {
    console.error('Ошибка при обновлении сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});




app.delete('/api/messages/:messageId', async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.messageId);

    if (!deletedMessage) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }

    console.log("messageDeleted");
    // Отправляем событие WebSocket о том, что сообщение удалено
    io.to(deletedMessage.chat_id.toString()).emit('messageDeleted', deletedMessage._id);
    console.log("messageDeleted2");

    res.json({ message: 'Сообщение удалено' });
  } catch (error) {
    console.error('Ошибка при удалении сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});




app.post("/api/posts", async (req, res) => {
  try {
    console.log(req.body);
    const { user_id, content, image_url } = req.body;

    const newPost = new Post({ user_id, content, image_url });
    await newPost.save();

    const populatedPost = await Post.findById(newPost._id).populate(
      "user_id",
      "firstname surname"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при создании поста" });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("user_id", "firstname surname");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении постов" });
  }
});

app.get("/api/posts/:userId", async (req, res) => {
  try {
    console.log(req.params.userId);

    const posts = await Post.find({ user_id: req.params.userId })
      .populate("user_id", "firstname surname")
      .sort({ created_at: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Ошибка при получении постов пользователя:", error);
    res.status(500).json({ error: "Ошибка при получении постов пользователя" });
  }
});

app.delete("/api/posts/:postId", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: "Пост удалён" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при удалении поста" });
  }
});

const start = () => {
  try {
    httpServer.listen(PORT, () => console.log("Server started on port", PORT));
  } catch (e) {
    console.log(e);
  }
};

start();
