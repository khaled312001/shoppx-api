import { Schema } from "mongoose";
import { getModel } from "../../../../../database";
import { IProductSpecification } from "./productSpecifications.schema";

export class SpecificationRepository {
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

  public async addSpecifications(
    specifications: IProductSpecification[]
  ): Promise<IProductSpecification[]> {
    const Specification = await this.getModel();
    return await Specification.insertMany(specifications);
  }

  // don't paginate it's a small collection
  public async findSpecifications(): Promise<IProductSpecification[]> {
    const Specification = await this.getModel();
    return await Specification.find();
  }

  public async findSpecificationByname(
    name: string
  ): Promise<IProductSpecification | null> {
    const Specification = await this.getModel();
    return await Specification.findOne({ name });
  }

  public async updateSpecification(
    specification: Partial<IProductSpecification> | IProductSpecification,
    specification_id: string
  ): Promise<IProductSpecification | null> {
    const Specification = await this.getModel();
    return await Specification.findByIdAndUpdate(
      specification_id,
      specification,
      {
        new: true,
      }
    );
  }

  public async deleteSpecification(
    specification_id?: string
  ): Promise<IProductSpecification | any> {
    const Specification = await this.getModel();
    return await Specification.findByIdAndUpdate(specification_id, {
      status: "deleted",
    });
  }
}