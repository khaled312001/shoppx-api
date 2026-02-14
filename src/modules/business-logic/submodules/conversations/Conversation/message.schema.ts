import mongoose, { Schema } from "mongoose";


export interface IMessage {
  _id?: string;
  conversationId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  text: string;
  read: boolean
}

export const messageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);
