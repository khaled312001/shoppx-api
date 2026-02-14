import { Schema } from "mongoose";
import { getModel } from "../../../../../database";
import { ICategory } from "./category.schema";

export class CategoryRepository {
  private connectionKey: string;
  private modelName: string;
  private schema: Schema;

  constructor(connectionKey: string, schema: Schema, modelName: string) {
    this.connectionKey = connectionKey;
    this.modelName = modelName || "Category";
    this.schema = schema;
  }

  private async getModel() {
    return await getModel(this.connectionKey, this.modelName, this.schema);
  }

  // Repository GET methods
  public async findActiveCategories(): Promise<ICategory[]> {
    const Category = await this.getModel();
    return Category.find({ status: "active" }).lean();
  }

  public async findAllCategories(): Promise<ICategory[]> {
    const Category = await this.getModel();
    return Category.find({ status: { $ne: "deleted" } }).lean();
  }

  public async findActiveParentCategories(): Promise<ICategory[]> {
    const Category = await this.getModel();
    return Category.find({
      status: "active",
      childrenIds: { $exists: true, $not: { $size: 0 } },
    }).lean();
  }

  public async findCategoriesWithIds(ids: string[]): Promise<ICategory[]> {
    const Category = await this.getModel();
    return Category.find({ _id: { $in: ids } }).lean();
  }
  public async findCategoriesWithSlugs(slugs: string[]): Promise<ICategory[]> {
    const Category = await this.getModel();
    return Category.find({ slug: { $in: slugs } }).lean();
  }

  public async SearchCategoriesByKeyword(
    categoryFilter: { name: string; value: string[] }
  ): Promise<ICategory[] | null> {
    const Category = await this.getModel();
    return Category.find({
      name: { $in: categoryFilter.value.map(keyword => new RegExp(keyword, 'i')) }
    }).lean();
  }

  public async findCategoryByKey(
    key: string,
    value: string
  ): Promise<ICategory | null> {
    const Category = await this.getModel();
    return Category.findOne({
      [key]: value,
      status: { $ne: "deleted" },
    })
      .lean();
  }

  // Repository POST methods
  public async addCategory(data: ICategory): Promise<ICategory> {
    const Category = await this.getModel();
    return Category.create(data);
  }

  public async bulckInsertCategories(data: ICategory[]): Promise<ICategory[]> {
    const Product = await this.getModel();
    return Product.insertMany(data);
  }

  // Repository PUT methods
  public async updateCategoryById(
    _id: string,
    data: Partial<ICategory>
  ): Promise<ICategory | null> {
    console.log(data, "Category");
    const Category = await this.getModel();
    return Category.findByIdAndUpdate(_id, data, { new: true }).lean();
  }
}
