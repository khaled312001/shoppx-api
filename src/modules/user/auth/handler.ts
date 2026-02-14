import { NextFunction, Request, Response } from "express";
import { generateSalt, hashPassword } from "./utils";
import { UserRepository } from "../User/user.repository";
import mongoose from "mongoose";
import { signJwt } from "../../../utils/jwt";
import { createUserAndToken } from "./helper";

export const handleLogout = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  // Check if the user is not signed in
  if (!req.user) {
    return res.status(400).json({ error: "User already signed out." });
  }
  req.user = undefined;
  return res.status(200).json({ message: "User signed out successfully." });
};

export const handleSignUp = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const salt = generateSalt();
    const { err, hash } = await hashPassword(req.body.password, salt);
    if (err || !hash) return next(err);

    const userRepository = new UserRepository(req.connectionKey);
    const existingUser = await userRepository.findUserByEmail(req.body.email);

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const { token, user } = await createUserAndToken(req.connectionFrom, {
      name: req.body.name,
      email: req.body.email,
      image: req.body.image,
      hash,
      salt,
      strategy: "local",
    });

    return res
      .status(201)
      .json({ message: "User created successfully", token, user });
  } catch (error: any) {
    console.log("aaaaa");
    console.log(error.message);
    switch (error.code) {
      case 11000:
        return res.status(409).json({
          error: "User already exists with this email.",
        });
      default:
        return res.status(error.status || 500).json({ error: error.message });
    }
  }
};

export const handleCallback = async (req: any, res: Response) => {
  const { email, name, image } = req.body;

  try {
    const userRepository = new UserRepository(req.connectionFrom);
    let existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      // If existing user account is active sign him in
      const token = signJwt(existingUser);
      return res.status(201).json({
        message: "User signed in successfully",
        token,
        user: existingUser,
      });
    }
    // if the user doesn't exist sign him up
    const { token, user } = await createUserAndToken(req.connectionFrom, {
      email,
      name,
      image,
      strategy: "google",
    });

    return res
      .status(201)
      .json({ message: "User created successfully", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
