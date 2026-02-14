
import express from "express";
import logger from "morgan";
import { connectMainDatabase } from "./database";
import { router } from "./router";
import { bindConnectionKey } from "./middleware/connection-key-binder.middleware";
import errorhandler from "errorhandler";
import { stripeRouter } from "./modules/business-logic/submodules/stripe/router";
import { authRouter } from "./modules/user/auth/router";

require("dotenv").config();

const app = express();

connectMainDatabase();

app.use(logger("dev"));
app.use(errorhandler());

app.use("/api/v1/stripe", stripeRouter);
app.use("/api/v1/auth", authRouter);
app.use(express.json()); // Must be after stripe router. Otherwise, stripe webhooks won't work
app.use("/api/v1", bindConnectionKey, router);

export default app;
