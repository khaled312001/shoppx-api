import { Schema, Types } from "mongoose";
import { getModel, getTenantConnection } from "../../../../../database";
import { IMessage } from "./message.schema";
import { conversationSchema } from "./conversation.schema";
import { userSchema } from "../../../../user/User/user.schema";



export class MessageRepository {
  private connectionKey: string;
  private modelName: string;
  private schema: Schema;

  constructor(connectionKey: string, schema: Schema, modelName: string) {
    this.connectionKey = connectionKey;
    this.modelName = modelName || "Message";
    this.schema = schema;
  }

  private async getModel() {
    const connection = await getTenantConnection(this.connectionKey);
    if (!connection.models["Conversation"]) {
      connection.model("Conversation", conversationSchema);
    }
    if (!connection.models["User"]) {
      connection.model("User", userSchema);
    }
    return await getModel(this.connectionKey, this.modelName, this.schema);
  }

  public async sendMessage(
    senderId: string,
    text: string,
    conversationId: string
  ): Promise<IMessage | null> {
    const Message = await this.getModel();
    let newMessage = new Message({ senderId, text, conversationId, timestamp: new Date() });

    return newMessage.save().then((t: { populate: (arg0: { path: string; select: string; }) => any; }) => t.populate({ path: "senderId", select: "name email image" }));
  }


  public async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<any> {
    const Message = await this.getModel();
    console.log("conversationId Type:", typeof conversationId);
    console.log("conversationId", conversationId);
    console.log("userId", userId);

    const result = await Message.updateMany(
      { conversationId: new Types.ObjectId(conversationId), senderId: { $ne: new Types.ObjectId(userId) }, read: false },
      { $set: { read: true } },
      { strict: false }
    );

    return result;
  }

  public async getUnReadMessages(
    conversationId: string,
    userId: string
  ): Promise<any> {
    const Message = await this.getModel();
    console.log("conversationId",conversationId)
    console.log("userId",userId)
  
    let unreadMessages = await Message.countDocuments({
      conversationId,
      read: false,
      senderId: { $ne: new Types.ObjectId(userId) }
    });

    return unreadMessages;
  }

}
