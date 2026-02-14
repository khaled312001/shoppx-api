import { Schema } from "mongoose";

export interface IOrderItem {
  _id?: string;
  user_id?: string;
  product_id: Schema.Types.ObjectId;
  variationGroupId: Schema.Types.ObjectId;
  name: string;
  thumpnail: string;
  sku: string;
  quantity: number;
  order_id?: Schema.Types.ObjectId;
  orderNumber?: string;
}

export const orderItemsSchema = new Schema<IOrderItem>({
  product_id: { type: Schema.Types.ObjectId, ref: "Product" },
  user_id: { type: Schema.Types.ObjectId, ref: "User" },
  variationGroupId: { type: Schema.Types.ObjectId, ref: "VariationGroup" },
  name: { type: String },
  thumpnail: { type: String },
  sku: { type: String },
  quantity: { type: Number },
  order_id: { type: Schema.Types.ObjectId, ref: "Order", required: false },
  orderNumber: { type: String, required: false },
});
