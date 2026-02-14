import { Schema } from "mongoose";

export interface IWishlist {
  userId: Schema.Types.ObjectId;
  items: {
    productId: Schema.Types.ObjectId;
    quantity: number;
  }[];
}

export const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);
