import { serve } from "inngest/vercel";
import { inngest, functions } from "../inngest/index.js";
import connectDB from "../configs/db.js";

// Ensure DB connection before running any function
await connectDB();

export default serve({
  client: inngest,
  functions,
});
