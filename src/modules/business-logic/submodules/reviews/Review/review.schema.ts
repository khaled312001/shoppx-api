import { Schema } from "mongoose";

export interface IReview {
  _id?: string;
  description: string;
  name: string;
  email: string;
  rating: number;
  product_id: Schema.Types.ObjectId;
}

export const reviewSchema = new Schema<IReview>({
  description: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: false,
  }
},
{ timestamps: true });
