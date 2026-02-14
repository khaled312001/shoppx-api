import express from "express";
import { tenantRouter } from "./submodules/tenants/router";
import { authorize } from "../../middleware/auth/authorization.factory-middleware";

export const superRouter = express.Router();
superRouter.use("/tenants", tenantRouter);
superRouter.use
