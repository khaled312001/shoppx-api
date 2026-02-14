import { Schema } from "mongoose";
import { getModel } from "../../../../../database";

export class ContactRepository {
  private connectionKey: string;
  private modelName: string;
  private schema: Schema;

  constructor(connectionKey: string, schema: Schema, modelName: string) {
    this.connectionKey = connectionKey;
    this.modelName = modelName;
    this.schema = schema;
  }

  private async getModel() {
    return await getModel(this.connectionKey, this.modelName, this.schema);
  }

  public async addContact(contact: any): Promise<any> {
    const Contact = await this.getModel();
    const newContact = new Contact(contact);
    const savedContact = await newContact.save();
    return savedContact.toObject(); // Convert to plain JavaScript object
  }

  public async handleGetVisitors() {
    const Contact = await this.getModel();
    return await Contact.find()
  }

}
