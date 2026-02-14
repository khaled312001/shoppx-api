import express from "express";
import {
  handleDeleteUserAccount,
  handleGetAllUsersProfiles,
  handleGetSingleUserAccount,
  handleGetSingleUserProfile,
  handleUpdateUserAccount,
  handleGetUserFromRequest,
  handleUpdateUserAuthorization,
  handleSoftDeleteUserAccount,
  handleGetTenantAdmins,
} from "./handler";

import { authorize } from "../../middleware/auth/authorization.factory-middleware";

export const userRouter = express.Router();

userRouter.get("/", handleGetAllUsersProfiles);
userRouter.get("/me", handleGetUserFromRequest);
userRouter.get(
  "/admins/:tenantName",
  authorize(["super", "admin"]),
  handleGetTenantAdmins
);

userRouter.get("/:user_id/profile", handleGetSingleUserProfile);

// only the user can access their account
userRouter.get("/:user_id/account", handleGetSingleUserAccount);
userRouter.put("/:user_id", handleUpdateUserAccount);

userRouter.put(
  "/:user_id/authorization",
  authorize(["super", "admin"]),
  handleUpdateUserAuthorization
);

userRouter.delete("/:user_id/account", handleSoftDeleteUserAccount);

userRouter.delete(
  "/:user_id/account/hard",
  handleDeleteUserAccount
);
