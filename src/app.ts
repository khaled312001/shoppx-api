
import express from "express";
import cors from "cors";
import logger from "morgan";
import { connectMainDatabase } from "./database";
import { router } from "./router";
import { bindConnectionKey } from "./middleware/connection-key-binder.middleware";
import errorhandler from "errorhandler";
import { stripeRouter } from "./modules/business-logic/submodules/stripe/router";
import { authRouter } from "./modules/user/auth/router";

require("dotenv").config();

const app = express();

// Store the DB connection promise so requests can wait for it
const dbReady = connectMainDatabase().catch((err: any) => {
  console.error("Initial database connection failed:", err.message);
});

app.use(
  cors({
    origin: [
      "https://www.mossodor.com",
      "https://mossodor.com",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-connection-key",
      "x-connection-from",
    ],
  })
);
  

app.use(logger("dev"));

app.get("/", (req, res) => {
  res.json({
    message: "Shoppx API is running successfully 🚀",
    version: "v1",
    health: "/health",
    api: "/api/v1",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/stripe", stripeRouter);
app.use("/api/v1/auth", authRouter);
app.use(express.json()); // Must be after stripe router. Otherwise, stripe webhooks won't work

// Wait for DB connection before processing any API requests (fixes Vercel cold start race condition)
app.use("/api/v1", async (req, res, next) => {
  await dbReady;
  next();
}, bindConnectionKey, router);

app.use(errorhandler());

export default app;
