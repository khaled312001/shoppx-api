import express from "express";
import { authRouter } from "./modules/user/auth/router";
import passport from "passport";
import {
  passportJWTStrategyMiddleware,
  passportLocalStrategyMiddleware,
} from "./modules/user/auth/middleware";
import { userRouter } from "./modules/user/router";
import { superRouter } from "./modules/super/router";
import businessLoginRouter from "./modules/business-logic/router";
import { verifyUser } from "./middleware/authentication.middleware";

// api/v1
export const router = express.Router();

router.use(passport.initialize());

passport.use("jwt", passportJWTStrategyMiddleware);
passport.use("local", passportLocalStrategyMiddleware);

// routes
// router.use("/auth", authRouter);
router.use("/users", verifyUser, userRouter);
router.use("/admin", verifyUser, superRouter);
router.use(businessLoginRouter);
