import { timingSafeEqual } from "crypto";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import { hashPassword } from "./utils";
import { UserRepository } from "../User/user.repository";

export const passportLocalStrategyMiddleware = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  async (req: any, email, password, done) => {
    try {
      const userRepository = new UserRepository(req.connectionFrom);
      const user = await userRepository.findUserByEmail(email);

      if (!user || user.status !== "active") return done(null, false);

      const { err, hash } = await hashPassword(password, String(user.salt));

      if (err || !hash) return done(err);

      if (
        !timingSafeEqual(
          Buffer.from(user.hash, "hex"),
          Buffer.from(hash, "hex")
        )
      ) {
        return done(null, false, {
          message: "Incorrect email or password.",
        });
      }
      return done(null, user);
    } catch (err: any) {
      return done(err);
    }
  }
);

export const passportJWTStrategyMiddleware = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: String(process.env.JWT_SECRET),
    passReqToCallback: true,
  },
  async (req: any, payload, done) => {
    try {
      const userRepository = new UserRepository(req.connectionFrom);
      const user = await userRepository.findUser(payload.userId, "profile");
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
);
