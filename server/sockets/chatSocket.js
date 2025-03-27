import { User } from "../models/User.js";
import { saveMessage, updateMessage, messageDelete } from "../utils/messageHandlers.js";

export default function setupChatSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("messageRoom", (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on("pageRoom", (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined postroom ${room}`);
    });

    socket.on("chatMessage", async (message) => {
      const savedMessage = await saveMessage(message);

      try {
        const user = await User.findById(savedMessage.user_id);
        savedMessage.username = user?.username || "Erroe";
      } catch (error) {
        console.error("User retrieving error:", error);
        savedMessage.username = "Error";
      }

      io.to(savedMessage.chat_id.toString()).emit("chatMessage", {
        _id: savedMessage._id,
        chat_id: savedMessage.chat_id,
        user_id: savedMessage.user_id,
        content: savedMessage.content,
        username: savedMessage.username,
      });

      console.log(`Message in room ${savedMessage.chat_id} from ${savedMessage.username}`);
    });

    socket.on("messageUpdated", async (message) => {
      const updatedMessage = await updateMessage(message);
      try {
        const user = await User.findById(updatedMessage.user_id);
        if (user) {
          updatedMessage.username = user.username;
        }
      } catch (error) {
        console.error("User retrieving error:", error);
      }

      io.to(updatedMessage.chat_id).emit("messageUpdated", updatedMessage);
      console.log(`Message in room ${updatedMessage.chat_id} from ${updatedMessage.username}`);
    });

    socket.on("messageDelete", async (messageId) => {
      const deletedMessage = await messageDelete(messageId);

      io.to(deletedMessage.chat_id.toString()).emit("messageDeleted", deletedMessage._id);
      console.log("messageDeleted");
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
