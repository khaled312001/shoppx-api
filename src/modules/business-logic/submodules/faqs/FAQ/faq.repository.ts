import { Schema } from "mongoose";
import { getModel } from "../../../../../database";
import { IFaq } from "./faq.schema";

export class FaqRepository {
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

  public async addFaq(data: IFaq, product_id: string): Promise<IFaq> {
    const Faq = await this.getModel();
    return new Faq({ ...data, product_id }).save();
  }

  public async updateFaqs(data: IFaq[]): Promise<string[]> {
    const Faq = await this.getModel();
    let faqIds: string[] = [];

    for (const faq of data) {
      if (faq._id) {
        // Update existing FAQ
        const updatedFaq = await Faq.findByIdAndUpdate(faq._id, faq, {
          new: true,
        });
        if (updatedFaq) {
          faqIds.push(updatedFaq._id.toString());
        }
      } else {
        // Add new FAQ
        const newFaq = new Faq({ ...faq });
        const savedFaq = await newFaq.save();
        faqIds.push(savedFaq._id.toString());
      }
    }

    return faqIds;
  }

  public async addMultipleFaqs(data: IFaq[]): Promise<IFaq[]> {
    const Faq = await this.getModel();
    return Faq.insertMany(data.map((faq) => ({ ...faq })));
  }

  public async getProductFaqs(ids: string): Promise<IFaq[]> {
    const Faq = await this.getModel();
    return (await Faq.find({ _id: { $in: ids } }).lean()) as IFaq[];
  }
}
