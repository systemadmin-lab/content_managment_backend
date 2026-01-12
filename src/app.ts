import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import path from "path";
import { Server } from "socket.io";
import connectDB from "./config/db";
import contentRoutes from "./routes/contentRoutes";
import generateRoutes from "./routes/generateRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config({ path: path.join(__dirname, "../.env") });

connectDB();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow all origins for now
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Map user IDs to socket IDs
const userSockets = new Map<string, string>();

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    socket.data.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.data.userId}`);
  userSockets.set(socket.data.userId, socket.id);

  socket.on("disconnect", () => {
    userSockets.delete(socket.data.userId);
    console.log(`User disconnected: ${socket.data.userId}`);
  });
});

// Redis Subscriber for job completion events
const redisSubscriber = new Redis({
  host: process.env.REDIS_ENDPOINT || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  username: process.env.REDIS_USER || "default",
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

redisSubscriber.subscribe("job_completed", (err, count) => {
  if (err) {
    console.error("Failed to subscribe: %s", err.message);
  } else {
    console.log(
      `Subscribed to ${count} channels. Listening for updates on 'job_completed'.`
    );
  }
});

redisSubscriber.on("message", (channel, message) => {
  if (channel === "job_completed") {
    const jobResult = JSON.parse(message);
    const socketId = userSockets.get(jobResult.userId);

    if (socketId) {
      io.to(socketId).emit("job_completed", jobResult);
      console.log(`Emitted job_completed to user ${jobResult.userId}`);
    }
  }
});

app.use(express.json());
app.use("/auth", userRoutes);
app.use("/content", contentRoutes);
app.use("/generate-content", generateRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
