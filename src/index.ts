import express, { Request, Response, NextFunction } from "express";
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
const PORT = process.env.PORT || 8080;

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

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something went wrong!" });
});

const startServer = async () => {
  try {
    await mongoDBConnect();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
