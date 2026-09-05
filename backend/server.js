import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import executeRoutes from "./routes/executeRoutes.js";
import { db } from "./db/database.js";

configDotenv();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend dev server and production
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/execute", executeRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Coding Guru API",
    time: new Date().toISOString()
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("Coding Guru Backend API is operational.");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`Coding Guru Backend running on http://localhost:${PORT}`);
});