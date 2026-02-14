import { Schema } from "mongoose";

export interface WarrantyForm {
  buyerFirstName: string;
  buyerLastName: string;
  buyerEmail: string;
  market: string;
  productSKU: string;
  purchaseDate: number;
  productUse: string;
  invoiceImage: string;
  installationImage: string;
  hadQualifiedTechnicianInstall: boolean;
  orderNumber: string;
  order_id?: string;
  user_id?: string;
}

export const warrantyFormSchema = new Schema<WarrantyForm>(
  {
    buyerFirstName: { type: String, required: true },
    buyerLastName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    market: { type: String, required: true },
    productSKU: { type: String, required: true },
    purchaseDate: { type: Number, required: true },
    productUse: { type: String, required: true },
    invoiceImage: { type: String, required: true },
    installationImage: { type: String, required: true },
    hadQualifiedTechnicianInstall: { type: Boolean, required: true },
    orderNumber: { type: String, required: true },
    order_id: { type: String },
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);
