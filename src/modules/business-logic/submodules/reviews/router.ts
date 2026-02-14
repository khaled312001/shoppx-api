import { Router } from "express";
import { handleAddReview, handleGetProductReviews } from "./handler";

export const reviewsRouter = Router();
reviewsRouter.post("/", handleGetProductReviews);
reviewsRouter.post("/:id", handleAddReview);

export default reviewsRouter;