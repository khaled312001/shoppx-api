import { Schema } from "mongoose";

export interface IVariationGroup {
  _id: string;
  product_id: Schema.Types.ObjectId;
  selectors: any;
  variations: {
    stock?: number;
    type: string;
    value: string;
    sku: string;
    ean: string;
    price: number;
    discount: number;
    weight: string;
    height: string;
    width: string;
    length: string;
    images: string[];
    thumpnail: string;
    otherSpecifications: any[];
  }[];
}

export const variationGroupSchema = new Schema<IVariationGroup>({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", unique: true },
  selectors: { type: Schema.Types.Mixed, required: true },
  variations: [
    {
      stock: { type: Number },
      type: { type: String, required: true },
      value: { type: String, required: true },
      sku: { type: String },
      ean: { type: String },
      price: { type: Number },
      discount: { type: Number },
      weight: { type: String },
      height: { type: String },
      width: { type: String },
      length: { type: String },
      images: { type: [String] },
      thumpnail: { type: String },
      otherSpecifications: { type: [Schema.Types.Mixed] },
    },
  ],
});
