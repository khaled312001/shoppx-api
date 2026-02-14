import { Schema } from "mongoose";
import { IUser } from "../../../../user/User/user.schema";

export interface IAddress {
  city: string;
  country: string;
  line1: string | undefined;
  line2: string | undefined;
  postal_code: string | undefined;
  state: string | undefined;
}

export type TOrderStatus =
  | "pending"
  | "awaiting fulfillment"
  | "awaiting shipment"
  | "awaiting pickup"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "refunded with return";

export interface IOrder {
  _id?: any;
  orderNumber: string;
  subtotal: number;
  total: number;
  shipping?: number;
  status: string | null;
  paymentStatus: string | null;
  trackingNumber?: string;
  trackingURL?: string;
  carrierName?: string;
  buyerName: string | undefined;
  buyerEmail: string | undefined;
  buyerPhone: string | undefined;
  shippingRate?: string;
  shippingMethod?: string;
  purchaseDate: number;
  currencyCode: string;
  address: IAddress;
  user_id: string | Schema.Types.ObjectId | IUser;
  discount: number;
  warranty_id?: string;
}

export const orderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  shipping: { type: Number },
  status: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  trackingNumber: { type: String, default: undefined },
  trackingURL: { type: String, default: undefined },
  carrierName: { type: String },
  buyerName: { type: String },
  buyerEmail: { type: String },
  buyerPhone: { type: String },
  shippingRate: { type: String },
  shippingMethod: { type: String },
  purchaseDate: { type: Number, required: true },
  currencyCode: { type: String, required: true },
  address: {
    city: { type: String, required: true },
    country: { type: String, required: true },
    line1: { type: String },
    line2: { type: String },
    postal_code: { type: String },
    state: { type: String },
  },
  discount: { type: Number, default: 0 },
  user_id: { type: Schema.Types.ObjectId, ref: "User" },
  warranty_id: { type: Schema.Types.ObjectId, ref: "WarrantyForm" },
});
