import express from "express";
import cors from "cors";
import "dotenv/config.js";
import connectDB from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";


const app = express();

// Connect DB once
await connectDB();

app.use(express.json());
app.use(cors());

// Health check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Inngest route (for local testing)
// 👉 http://localhost:4000/api/inngest
app.use("/api/inngest", serve({ client: inngest, functions }));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
