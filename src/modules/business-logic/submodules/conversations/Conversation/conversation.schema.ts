import mongoose, { Schema } from "mongoose";

export interface IConversation {
    userId: Schema.Types.ObjectId;
    adminId: string;
    messages?: Schema.Types.ObjectId[];
    lastMessage?: Schema.Types.ObjectId;
}

export const conversationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    adminId: { type: String, required: true, default: "admin" },
    messages: {
        type: [Schema.Types.ObjectId],
        ref: "Message",
        default: [],
      },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: null,
      },
});

export const Conversation = mongoose.model("Conversation", conversationSchema);
