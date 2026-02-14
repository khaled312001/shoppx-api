import { Schema } from "mongoose";
import { getModel } from "../../../../../database";

export class WarrantyFormRepository {
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

  public async addWarrantyForm(warrantyForm: any): Promise<any> {
    const WarrantyForm = await this.getModel();
    const newWarrantyForm = new WarrantyForm(warrantyForm);
    const savedWarrantyForm = await newWarrantyForm.save();
    return savedWarrantyForm.toObject(); // Convert to plain JavaScript object
  }

  public async getUserWarranties(user_id: string) {
    const WarrantyForm = await this.getModel();
    return await WarrantyForm.find({ user_id })
  }

  public async getAllWarranties() {
    const WarrantyForm = await this.getModel();
    return await WarrantyForm.find()
  }

  public async getWarrantyFormById(id: string) {
    const WarrantyForm = await this.getModel();
    return await WarrantyForm.findById(id);
  }
}
