import { Schema } from "mongoose";

export interface IProduct {
  _id?: string;
  popular?: boolean;
  categoryIds: string[];
  name: string;
  slug: string;
  description: string;
  sku: string;
  ean: string;
  thumpnail: string;
  images: string[];
  altText: string;
  metaTitle: string;
  metaDescription: string;
  weight: string | null;
  width: string | null;
  height: string | null;
  length: string | null;
  price: number;
  discount: number | null;
  applyDiscount: boolean;
  stock?: number;
  otherSpecifications: any[];
  faqs: Schema.Types.ObjectId[];
  reviews: Schema.Types.ObjectId[];
  variationGroupId: string | null;
}

export const ProductSchema = new Schema<IProduct>({
  categoryIds: {
    type: [String],
    required: [true, "At least one category must be selected"],
    validate: {
      validator: (value: string[]) => value.length > 0,
      message: "At least one category must be selected",
    },
  },
  popular: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [1, "Name must be at least 1 character long"],
    maxlength: [100, "Name must be less than 100 characters long"],
  },
  slug: {
    type: String,
    required: [true, "Slug is required"],
    trim: true,
    minlength: [1, "Slug must be at least 1 character long"],
    maxlength: [100, "Slug must be less than 100 characters long"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    minlength: [3, "Description must be at least 1 character long"],
  },
  sku: {
    type: String,
    required: [true, "SKU is required"],
    trim: true,
    unique: true,
    minlength: [3, "SKU must be at least 1 character long"],
    maxlength: [50, "SKU must be less than 50 characters long"],
  },
  ean: {
    type: String,
    required: [true, "EAN is required"],
    trim: true,
    minlength: [3, "EAN must be at least 1 character long"],
    maxlength: [50, "EAN must be less than 50 characters long"],
  },
  thumpnail: {
    type: String,
    required: [true, "Thumbnail is required"],
    trim: true,
  },
  images: {
    type: [String],
    required: [true, "At least one image must be provided"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be at least 0"],
    max: [100000, "Price must be less than or equal to 10000  0"],
  },
  altText: {
    type: String,
    required: [true, "Alt text is required"],
    trim: true,
    minlength: [1, "Alt text must be at least 1 character long"],
    maxlength: [100, "Alt text must be less than 100 characters long"],
  },
  metaTitle: {
    type: String,
    required: [true, "Meta title is required"],
    trim: true,
    minlength: [1, "Meta title must be at least 1 character long"],
    maxlength: [100, "Meta title must be less than 100 characters long"],
  },
  metaDescription: {
    type: String,
    required: [true, "Meta description is required"],
    trim: true,
    minlength: [1, "Meta description must be at least 1 character long"],
    maxlength: [1000, "Meta description must be less than 200 characters long"],
  },
  weight: {
    type: String,
    trim: true,
  },
  width: {
    type: String,
  },
  height: {
    type: String,
  },
  length: {
    type: String,
  },
  discount: {
    type: Number,
    default: null,
    // min: [0, "Discount must be at least 0"],
    // max: [100, "Discount must be less than or equal to 100"],
  },
  applyDiscount: {
    type: Boolean,
    default: false,
  },
  stock: {
    type: Number,
    default: 0,
  },
  otherSpecifications: {
    type: Schema.Types.Mixed,
    default: [],
    required: [true, "Specifications are required"],
  },
  faqs: {
    type: [Schema.Types.ObjectId],
    ref: "Faq",
    default: [],
  },
  reviews: {
    type: [Schema.Types.ObjectId],
    ref: "Review",
    default: [],
  },
  variationGroupId: {
    type: String,
    default: null,
  },
});
