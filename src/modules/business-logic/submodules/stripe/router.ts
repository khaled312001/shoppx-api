import express, { Router } from "express";
import { handleCreateCheckoutSession } from "./handler";
import { handleWebhook } from "./webhooks";
const cors = require('cors');

export const stripeRouter = Router();

const corsOptions = {
  origin: "https://www.mossodor.com", // Replace with your frontend's URL
  //origin: "http://localhost:3000", // Replace with your frontend's URL
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: 'Content-Type, x-connection-key',
};

stripeRouter.use(cors(corsOptions));

// stripe webhook gets the row body.payload. It is not a json object.
stripeRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

stripeRouter.use(express.json()); // Must be after webhook.
stripeRouter.post("/create-checkout-session", handleCreateCheckoutSession);
