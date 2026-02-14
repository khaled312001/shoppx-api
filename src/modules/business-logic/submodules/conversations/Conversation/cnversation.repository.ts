import { ObjectId, Schema } from "mongoose";
import { getModel, getTenantConnection } from "../../../../../database";
import { IConversation } from "./conversation.schema";
import { messageSchema } from "./message.schema";


export class ConversationRepository {
  private connectionKey: string;
  private modelName: string;
  private schema: Schema;

  constructor(connectionKey: string, schema: Schema, modelName: string) {
    this.connectionKey = connectionKey;
    this.modelName = modelName || "Conversation";
    this.schema = schema;
  }

  private async getModel() {
    const connection = await getTenantConnection(this.connectionKey);
    if (!connection.models["Message"]) {
      connection.model("Message", messageSchema);
    }
    if (!connection.models["User"]) {
      connection.model("User", messageSchema);
    }
    return await getModel(this.connectionKey, this.modelName, this.schema);
  }

  public async findAllConversations(): Promise<IConversation[]> {
    const Conversation = await this.getModel();
    return Conversation.find().populate(["lastMessage", "userId"]);
  }

  public async findConversation(
    conversationId: string,
    population: any[]
  ): Promise<IConversation | null> {
    const Conversation = await this.getModel();
    return Conversation.findOne({ _id: conversationId }).populate(population);;
  }

  public async findConversationByUserId(
    userId: string,
    population: any[]
  ): Promise<IConversation | null> {
    const Conversation = await this.getModel();
    return Conversation.findOne({ userId }).populate(population);
  }

  public async startConversation(
    userId: string
  ): Promise<IConversation | null> {
    const Conversation = await this.getModel();
    const conversation = new Conversation({ userId, messages: [] });
    return await conversation.save();
  }

  public async addConversation(data: IConversation): Promise<IConversation> {
    const Conversation = await this.getModel();
    return Conversation.create(data);
  }

  public async updateConversationById(
    conversationId: ObjectId,
    newMessage: any
  ): Promise<IConversation | null> {
    const Conversation = await this.getModel();
    const conversation = await Conversation.findById(conversationId);
    conversation.messages.push(newMessage._id);
    conversation.lastMessage = newMessage._id;
    return await conversation.save();
  }

}
