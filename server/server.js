import express from "express";
import cors from "cors";
import "dotenv/config.js";
import mongoose from "mongoose";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";

// --- MongoDB connection with caching (serverless safe) ---
let cached = global.mongo;
if (!cached) cached = global.mongo = { conn: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("MongoDB connected ✅");
  return cached.conn;
}

// --- Initialize Express ---
const app = express();
app.use(express.json());
app.use(cors());

// --- Health check route ---
app.get("/", (req, res) => res.send("Server is running ✅"));

// --- Inngest route ---
app.use("/api/inngest", async (req, res, next) => {
  try {
    await connectDB(); // ensure DB is connected
    return serve({ client: inngest, functions })(req, res, next);
  } catch (err) {
    console.error("Error in /api/inngest:", err);
    return res.status(500).json({ error: err.message });
  }
});

// --- Optional: Start server locally ---
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  });
}

export default app; // Vercel uses this as serverless entry point
