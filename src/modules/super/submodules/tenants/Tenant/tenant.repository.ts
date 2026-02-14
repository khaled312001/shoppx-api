import { Schema } from "mongoose";
import { ITenant, tenantSchema } from "./tenant.schema";
import { getModel } from "../../../../../database";

export class TenantRepository {
  private connectionKey: string;
  private modelName: string;
  private schema: Schema;

  constructor(connectionKey: string) {
    this.connectionKey = connectionKey;
    this.modelName = "Tenant";
    this.schema = tenantSchema;
  }

  private async getModel() {
    return await getModel(this.connectionKey, this.modelName, this.schema);
  }

  public async addTenant(tenantData: ITenant): Promise<ITenant> {
    const Ternant = await this.getModel();
    return await new Ternant(tenantData).save();
  }

  public async findAllTenants(): Promise<ITenant[]> {
    const Ternant = await this.getModel();
    return (await Ternant.find().lean().exec()) as unknown as ITenant[];
  }

  public async findAllActiveTenants(): Promise<ITenant[]> {
    const Tenant = await this.getModel();
    return (await Tenant.find({ status: "active" })
      .lean()
      .exec()) as unknown as ITenant[];
  }

  public async findAllDeletedTenants(): Promise<ITenant[]> {
    const Tenant = await this.getModel();
    return (await Tenant.find({ status: "deleted" })
      .lean()
      .exec()) as unknown as ITenant[];
  }

  public async findAllSuspendedTenants(): Promise<ITenant[]> {
    const Tenant = await this.getModel();
    return (await Tenant.find({ status: "suspended" })
      .lean()
      .exec()) as unknown as ITenant[];
  }

  public async updateTenant(
    tenant: Partial<ITenant & { _id: string }>
  ): Promise<ITenant | null> {
    const Tenant = await this.getModel();
    return (await Tenant.findByIdAndUpdate(
      tenant._id,
      { $set: tenant },
      { new: true }
    )
      .lean()
      .exec()) as unknown as ITenant;
  }

  public async findTernantByKey(
    key: string = "_id",
    value: any
  ): Promise<ITenant | null> {
    const Ternant = await this.getModel();
    return (await Ternant.findOne({ [key]: value })
      .lean()
      .exec()) as unknown as ITenant;
  }

  public async findTenantsByNames(names: string[]): Promise<ITenant[]> {
    const Tenant = await this.getModel();
    return (await Tenant.find({ name: { $in: names } })
      .lean()
      .exec()) as unknown as ITenant[];
  }
}
