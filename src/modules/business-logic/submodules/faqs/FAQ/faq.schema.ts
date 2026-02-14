import { Schema } from "mongoose";

export interface IFaq {
  _id?: string;
  q: string;
  a: string;
  product_id: Schema.Types.ObjectId;
}

export const faqSchema = new Schema<IFaq>({
  q: {
    type: String,
    required: true,
  },
  a: {
    type: String,
    required: true,
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: false,
  },
});
