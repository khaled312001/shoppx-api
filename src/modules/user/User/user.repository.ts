import { Schema } from "mongoose";
import { getModel } from "../../../database";
import { userSchema, IUser } from "./user.schema";

export class UserRepository {
  private connectionKey: string;
  private modelName: string;
  private schema: Schema;

  // for simpler initialization modleName and schema are hard coded. it's the user repo
  // what else would it serve other then users.
  constructor(connectionKey: string) {
    this.connectionKey = connectionKey;
    this.modelName = "User";
    this.schema = userSchema;
  }

  private async getModel() {
    return await getModel(this.connectionKey, this.modelName, this.schema);
  }

  public async addUser(userData: Partial<IUser>): Promise<IUser | any> {
    const User = await this.getModel();
    const userExists = await User.findOne({ email: userData.email });
    if (userExists) {
      throw new Error("User already exists");
    }
    const user = new User(userData);
    return user.save();
  }

  public async findAcitveUsersProfiles(
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ users: any[]; totalCount: number }> {
    const User = await this.getModel();
    const skip = (page - 1) * pageSize;
    const [users, totalCount] = await Promise.all([
      User.find(
        { status: "active" },
        "name email status role tenant_ids tenant_names image strategy createdAt"
      )
        .lean()
        .skip(skip)
        .limit(pageSize)
        .exec(),
      User.countDocuments({}),
    ]);

    return { users, totalCount };
  }

  public async findUser(
    userId: string,
    type: "profile" | "account"
  ): Promise<any> {
    const User = await this.getModel();
    const projection =
      type === "profile"
        ? "name email username status role tenant_ids tenant_names image"
        : "";

    return User.findOne({ _id: userId, status: "active" }, projection).lean();
  }

  public async deleteUser(userId: string): Promise<any> {
    const User = await this.getModel();
    return await User.deleteOne({ _id: userId }).exec();
  }

  public async updateUserAccount(user: Partial<IUser>): Promise<any> {
    const User = await this.getModel();
    return User.updateOne({ _id: user._id }, { $set: user }).exec();
  }

  public async findUserByEmail(email: string): Promise<IUser | any> {
    const User = await this.getModel();
    return User.findOne({ email: email }).lean().exec();
  }

  public async findTenantUsers(tenantName: string): Promise<any[]> {
    const User = await this.getModel();
    return User.find({ tenant_names: { $in: [tenantName] } })
      .lean()
      .exec();
  }
  // Add more methods as needed...
}
