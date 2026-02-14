import { Schema } from "mongoose";

export interface ITenant extends Document {
  name: string;
  description: string;
  website: string;
  supportEmail: string;
  status: "active" | "suspended" | "deleted";
  createdBy: string;
  members: string[];
  uri: string;
  origin: string;
}

export const tenantSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    website: { type: String, required: false },
    supportEmail: { type: String, required: false },
    uri: { type: String, required: true, unique: true },
    status: {
      type: String,
      default: "active",
      enum: ["active", "suspended", "deleted"],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    origin: { type: String, required: true, default: "localhost" },
  },
  { timestamps: true }
);
