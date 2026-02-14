import { Schema } from "mongoose";
import { getModel } from "../../../../../database";

export class VariationGroupRepository {
  private connectionKey: string;
  private modelName: string;
  private schema: Schema;

  constructor(connectionKey: string, schema: Schema, modelName: string) {
    this.connectionKey = connectionKey;
    this.modelName = modelName || "VariationGroup";
    this.schema = schema;
  }

  private async getModel() {
    return await getModel(this.connectionKey, this.modelName, this.schema);
  }

  // Repository GET methods
  // Repository POST methods
  public async addVariationGroup(variationGroup: any) {
    const VariationGroup = await this.getModel();
    const newVariationGroup = new VariationGroup(variationGroup);
    await newVariationGroup.save();
    return newVariationGroup;
  }

  public async updateVariationGroup(variationGroup: any, _id: string) {
    const VariationGroup = await this.getModel();
    await VariationGroup.findByIdAndUpdate(_id, variationGroup, {
      new: true,
    });
    return variationGroup;
  }

  public async findVariationGroupById(_id: string) {
    const VariationGroup = await this.getModel();
    return await VariationGroup.findById(_id).lean();
  }
}
