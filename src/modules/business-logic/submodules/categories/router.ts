import { Router } from "express";
import {
  updateCategoryStatus,
  getPopulatedParentCategories,
  getAllCategories,
  updateCategoryById,
  addCategory,
  getCategoryByKey,
  getCategoryChildren
} from "./handler";
const categoriesRouter = Router();

// returns all of tenants categories, with a children array containing the data of the categories.
// fetched by the ids in categoryIds. 
categoriesRouter.get("/parents", getPopulatedParentCategories);
categoriesRouter.get("/", getAllCategories);
categoriesRouter.get("/:key/:value", getCategoryByKey);
categoriesRouter.post("/children", getCategoryChildren)


categoriesRouter.post("/new", addCategory);

categoriesRouter.put("/:_id", updateCategoryById);
categoriesRouter.put("/:_id/:status", updateCategoryStatus);

export default categoriesRouter;
