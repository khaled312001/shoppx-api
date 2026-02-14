import { Schema } from "mongoose";

export interface ICategory {
  _id: string;
  childrenIds: string[];
  name: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  description: string;
  thumpnail: string;
  productsCount: number;
  status: "active" | "deleted" | "draft" | "disabled";
  htmlContent: string;
  // get populated and it's not stored in database
  children?: ICategory[];
}

export const CategorySchema = new Schema<ICategory>(
  {
    childrenIds: { type: [String] },
    name: { type: String, required: true },
    metaTitle: { type: String, required: false },
    metaDescription: { type: String, required: false },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    thumpnail: { type: String, required: false },
    productsCount: { type: Number, default: 0 },
    htmlContent: { type: String, required: false },
    status: {
      type: String,
      enum: {
        values: ["active", "deleted", "draft", "disabled"],
        message: "{VALUE} is not category status.",
      },
      default: "active",
    },
  },
  { timestamps: true }
);
