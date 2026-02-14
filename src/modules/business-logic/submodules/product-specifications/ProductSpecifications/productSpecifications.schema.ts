import { Schema } from "mongoose";

// This is used by admins before creating a product to define all the specs they need per tenant.
export interface IProductSpecification {
  name: string;
  required: boolean;
  type: "text" | "number" | "date" | "boolean" | "select" | "multiselect";
  options?: any[];
  status?: "active" | "deleted";
}

export const productSpecificationSchema = new Schema({
  name: { type: String, required: true, unique: true },
  required: { type: Boolean, default: false },
  type: {
    type: String,
    required: true,
    enum: ["text", "number", "date", "boolean", "select", "multiselect"],
  },
  options: [{ type: Schema.Types.Mixed }],
  status: {
    type: String,
    default: "active",
    enum: ["active", "deleted"],
  },
});