import express from "express";
import {
  handleGetSpecifications,
  handleAddNewSpecifications,
  handleUpdateSpecificationField,
  handleDeleteSpecificationField,
} from "./handler";

const productSpecificationsRouter = express.Router();

productSpecificationsRouter.get("/", handleGetSpecifications);
productSpecificationsRouter.post("/new", handleAddNewSpecifications);
productSpecificationsRouter.put(
  "/:specification_id",
  handleUpdateSpecificationField
);
productSpecificationsRouter.delete(
  "/:specification_id",
  handleDeleteSpecificationField
);
export default productSpecificationsRouter;
