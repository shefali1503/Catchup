import { serve } from "inngest/vercel";
import { inngest, functions } from "../../inngest/index.js";
import connectDB from "../../configs/db.js";

// Export handler for Vercel
export default serve({
  client: inngest,
  functions,
  onRequest: async () => {
    // Ensure DB connection before running any function
    await connectDB();
  },
});
