import express from "express";
import dotenv from "dotenv";
import { db, connection } from "./Config/db.js";
import commonApi from "./Apis/CommonApi.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use("/api/common", commonApi);

// Test Route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

async function startServer() {
  try {
    await db();
    console.log("Database connected successfully.");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:");
    console.error(error);
    process.exit(1);
  }
}

startServer();
app.get("/test-db", async (req, res) => {
  console.log("Testing database connection...");
});