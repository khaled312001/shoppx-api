import { Router } from "express";
import { handleAddWarrantyForm, handleGetAllWarranties, handleGetUserWarranties } from "./handler";

export const warrantyFormRouter = Router();
warrantyFormRouter.post("/", handleAddWarrantyForm);
warrantyFormRouter.get("/:user_id", handleGetUserWarranties);
warrantyFormRouter.get("/", handleGetAllWarranties);
