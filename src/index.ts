import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoDBConnect from "./mongoDB/connection";
import createChatRoutes from "./routes/Chat";
import createMessageRoutes from "./routes/Message";
import userRoutes from "./routes/User";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./swaggerDocs";
import multer from "multer";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
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
    console.log(`Message sent to chat: ${message.message}`);
  });

  socket.on("notification", (notification) => {
    io.to(notification.userId).emit("notification", notification);
    console.log(`Notification sent to user: ${notification.userId}`);
  });

  socket.on("sendImage", (data) => {
    io.to(data.chatId).emit("receiveImage", data);
    console.log(`Image sent to chat: ${data.chatId}`);
  });

  socket.on("sendFile", (data) => {
    io.to(data.chatId).emit("receiveFile", data);
    console.log(`File sent to chat: ${data.chatId}`);
  });
});

// Route for file upload
app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root URL route
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Realtime Chat API");
});

app.use("/api/chats", createChatRoutes(io));
app.use("/api/messages", createMessageRoutes(io));
app.use("/api/users", userRoutes);

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something went wrong!" });
});

const startServer = async () => {
  try {
    await mongoDBConnect();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        `Swagger docs available at http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
