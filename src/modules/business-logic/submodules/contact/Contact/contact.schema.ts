import { Schema } from "mongoose";

export interface Contact {
  email: string;
  name: string;
}

export const contactSchema = new Schema<Contact>(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
