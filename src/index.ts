import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoDBConnect from "./mongoDB/connection";
import createChatRoutes from "./routes/Chat";
import createMessageRoutes from "./routes/Message";
import userRoutes from "./routes/User";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);
    console.log(`User left chat: ${chatId}`);
  });

  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("typing", socket.id);
  });

  socket.on("stopTyping", (chatId) => {
    socket.to(chatId).emit("stopTyping", socket.id);
  });

  socket.on("sendMessage", (message) => {
    io.to(message.chatId).emit("message", message);
    console.log(`Message sent to chat: ${message.chatId}`);
  });

  socket.on("notification", (notification) => {
    io.to(notification.userId).emit("notification", notification);
    console.log(`Notification sent to user: ${notification.userId}`);
  });
});

app.use("/api/chats", createChatRoutes(io));
app.use("/api/messages", createMessageRoutes(io));
app.use("/api/users", userRoutes);

const startServer = async () => {
  await mongoDBConnect();
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
