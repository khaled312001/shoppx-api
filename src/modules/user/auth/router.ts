import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { handleCallback, handleLogout, handleSignUp } from "./handler";
import { verifyUser } from "../../../middleware/authentication.middleware";
import { bindConnectionKey } from "../../../middleware/connection-key-binder.middleware";
const cors = require('cors');

// api/v1/auth
export const authRouter = express.Router();
authRouter.use(express.json());
const corsOptions = {
 origin: "https://www.mossodor.com", // Replace with your frontend's URL
 //origin: "http://localhost:3000", // Replace with your frontend's URL
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: 'Content-Type, x-connection-key',
};

authRouter.use(cors(corsOptions));
authRouter.use(bindConnectionKey)

authRouter.post(
  "/login/password",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(401).json({ error: err }); // Access the error message
      }
      if (!user || err) {
        return res.status(401).json({ error: info }); // Access the error message
      }
      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        String(process.env.JWT_SECRET),
        {
          expiresIn: "2w",
        }
      );
      return res.status(200).json({ token, user });
    })(req, res, next);
  }
);

authRouter.post("/callback", handleCallback);

authRouter.post("/logout", verifyUser, handleLogout);



authRouter.post("/signup", handleSignUp);
