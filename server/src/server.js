import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { getJwtSecret, protect } from "./middleware/auth.js";

import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import applicationRoutes from "./routes/applications.js";
import mentorRoutes from "./routes/mentors.js";
import messageRoutes from "./routes/messages.js";
import communityRoutes from "./routes/community.js";
import leaderboardRoutes from "./routes/leaderboards.js";
import aiRoutes from "./routes/ai.js";
import roleRoutes from "./routes/roles.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

// Verify JWT_SECRET security policy at boot
getJwtSecret();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import mongoose from "mongoose";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (non-serverless local dev)
if (!process.env.VERCEL) {
  connectDB().catch((err) => console.error("[MongoDB Boot Error]", err.message));
}

// Serverless DB connection guard middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("[Database Connection Guard]", err.message);
    res.status(500).json({
      success: false,
      message: "Database connection failed. Please check Atlas IP whitelist.",
    });
  }
});

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        if (process.env.NODE_ENV === "production" && !origin.includes("localhost")) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      }
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Allows Vite development & assets
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Apply general API rate limiting
app.use("/api", generalLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/leaderboards", leaderboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", roleRoutes);

app.get("/api/media/:filename", protect, (req, res) => {
  const filename = path.basename(req.params.filename);
  const baseUploadDir = process.env.VERCEL
    ? path.join('/tmp', 'uploads', 'documents')
    : path.resolve(__dirname, "../uploads/documents");
  const filePath = path.resolve(baseUploadDir, filename);
  if (!fs.existsSync(filePath)) return res.status(404).end();
  res.sendFile(filePath);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    platform: "Project Match — Where Ideas Find the Right Team",
    version: "1.0.0",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date(),
  });
});

// Central 404 Handler for undefined API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} does not exist.`,
  });
});

// Centralized Error Handling Middleware (No stack traces in production)
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.stack || err.message);
  const statusCode =
    err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred.",
    code: err.code || "SERVER_ERROR",
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Project Match Server] Running on http://localhost:${PORT}`);
  });
}

export default app;
