import { Router } from "express";
import {
  handleGetUserWishlist,
  handleAddProductToWishlist,
  handleRemoveProductFromWishlist,
  handleGetUserWishlistItems,
} from "./handler";

const wishlistRouter = Router();

wishlistRouter.get("/:user_id", handleGetUserWishlist);
wishlistRouter.get("/:user_id/items", handleGetUserWishlistItems);
wishlistRouter.post("/:user_id/:product_id", handleAddProductToWishlist);
wishlistRouter.delete("/:user_id/:product_id", handleRemoveProductFromWishlist);

export default wishlistRouter;
