import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import executeRoutes from "./routes/executeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { db } from "./db/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
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
app.use("/api/ai", aiRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Coding Guru API",
    database: "SQLite (database.sqlite)",
    supportedLanguages: ["javascript", "python", "cpp", "java"],
    time: new Date().toISOString()
  });
});

// Serve frontend static build in production or container
const possibleDistPaths = [
  path.join(__dirname, "dist"),
  path.join(__dirname, "../frontend/dist")
];

let clientDist = null;
for (const p of possibleDistPaths) {
  if (fs.existsSync(p)) {
    clientDist = p;
    break;
  }
}

if (clientDist) {
  console.log(`Serving static frontend build from: ${clientDist}`);
  app.use(express.static(clientDist));

  // Fallback for client-side routing (any non-API GET route)
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  // Root route fallback if dist isn't built yet
  app.get("/", (req, res) => {
    res.send("Coding Guru Backend API is operational. Run frontend in dev mode or build frontend dist.");
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`Coding Guru Server running on http://localhost:${PORT}`);
});