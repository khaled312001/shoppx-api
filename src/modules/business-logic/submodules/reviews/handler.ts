import { Response } from "express";
import { HttpError } from "../../../../utils/httpError";
import { ProductSchema } from "../products/Product/product.schema";
import { ProductsRepository } from "../products/Product/product.repository";
import { ReviewRepository } from "./Review/review.repository";
import { reviewSchema } from "./Review/review.schema";
import { ObjectId } from "mongoose";


export const handleGetProductReviews = async (req: any, res: Response) => {
  const { ids } = req.body;
  try {
    if (!ids) {
      throw new HttpError(400, "Product id is required");
    }
    const reviewsReposityory = new ReviewRepository(
      req.connectionKey,
      reviewSchema,
      "Review"
    );
    const reviews = await reviewsReposityory.getProductReviews(ids);
    console.log("reviews", reviews);
    res.status(200).json({ reviews });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const handleAddReview = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    let reviewsIds: ObjectId[] = [];

    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );

    const product = await productsRepository.findProductById(id);

    if (!product) {
      throw new HttpError(400, "Product is required");
    }

    const reviewsRepository = new ReviewRepository(
      req.connectionKey,
      reviewSchema,
      "Review"
    );
    const { review } = req.body;
    const newReview = await reviewsRepository.addReview(review,id);
    reviewsIds = product.reviews;

    if(newReview){
      reviewsIds.push(newReview._id as any);
    }
     await productsRepository.updateProduct(id, { ...product, reviews: reviewsIds });
    return res.status(200).json({ message: "Product updated successfuly" });
  } catch (error: any) {
    console.log("sssssss", error.message);
      return res.status(error.status || 500).json({ message: error.message });
    
  }
};
