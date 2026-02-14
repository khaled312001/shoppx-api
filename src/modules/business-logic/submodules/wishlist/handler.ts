import { Response } from "express";
import { HttpError } from "../../../../utils/httpError";
import { wishlistSchema } from "./Wishlist/wishlist.schema";
import { ProductsRepository } from "../products/Product/product.repository";
import { ProductSchema } from "../products/Product/product.schema";
import { Schema } from "mongoose";
import { WishlistRepository } from "./Wishlist/wishlist.repository";

export const handleGetUserWishlist = async (req: any, res: Response) => {
  try {
    const { user_id } = req.params;
    if (!user_id) throw new HttpError(400, "User ID is required");
    const wishlistRepository = new WishlistRepository(
      req.connectionKey,
      wishlistSchema,
      "Wishlist"
    );
    const wishlist = await wishlistRepository.getUserWishlist(user_id);
    res.status(200).json({ wishlist });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
export const handleGetUserWishlistItems = async (req: any, res: Response) => {
  try {
    const { user_id } = req.params;
    if (!user_id) throw new HttpError(400, "User ID is required");

    const wishlistRepository = new WishlistRepository(
      req.connectionKey,
      wishlistSchema,
      "Wishlist"
    );
    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );

    const wishlist = await wishlistRepository.getUserWishlist(user_id);
    const wishlistItems = wishlist?.items || [];

    const populatedWishlistItems = await Promise.all(
      wishlistItems.map(
        async (item: {
          productId: Schema.Types.ObjectId;
          quantity: number;
        }) => {
          const product = await productsRepository.findProductById(
            item.productId.toString()
          );
          return {
            productId: item.productId.toString(),
            quantity: item.quantity,
            ...product,
          };
        }
      )
    );

    res.status(200).json({ items: populatedWishlistItems });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
export const handleAddProductToWishlist = async (req: any, res: Response) => {
  try {
    const { user_id, product_id } = req.params;
    if (!user_id) throw new HttpError(400, "User ID is required");
    console.log("add user_id",user_id)
    console.log("add product_id",product_id)
    const wishlistRepository = new WishlistRepository(
      req.connectionKey,
      wishlistSchema,
      "Wishlist"
    );

    await wishlistRepository.addItemToWishlist(user_id, product_id);
    res.status(200).json({ message: "Product added to wishlist" });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
export const handleRemoveProductFromWishlist = async (
  req: any,
  res: Response
) => {
  try {
    const { user_id, product_id } = req.params;
    if (!user_id) throw new HttpError(400, "User ID is required");
    if (!product_id) throw new HttpError(400, "Produt ID is required");
console.log("del user_id",user_id)
console.log("del product_id",product_id)
    const wishlistRepository = new WishlistRepository(
      req.connectionKey,
      wishlistSchema,
      "Wishlist"
    );
    await wishlistRepository.removeItemFromWishlist(user_id, product_id);
    res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
