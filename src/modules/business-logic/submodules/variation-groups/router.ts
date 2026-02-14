import { Router } from "express";
import {
  handleAddNewVariationGroup,
  handleUpdateVariationGroup,
  handleGetVariationGroup,
} from "./handler";

const variationGroupsRouter = Router();
variationGroupsRouter.post("/", handleAddNewVariationGroup);
variationGroupsRouter.put("/:_id", handleUpdateVariationGroup);
variationGroupsRouter.get("/:_id", handleGetVariationGroup);

export default variationGroupsRouter;
