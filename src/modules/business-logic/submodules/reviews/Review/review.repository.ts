import { Schema } from "mongoose";
import { getModel } from "../../../../../database";
import { IReview } from "./review.schema";


export class ReviewRepository {
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

  public async addReview(data: IReview, product_id: string): Promise<IReview> {
    const Review = await this.getModel();
    return new Review({ ...data, product_id }).save();
  }

  public async updateReviews(data: IReview[]): Promise<string[]> {
    const Review = await this.getModel();
    let reviewIds: string[] = [];

    for (const review of data) {
      if (review._id) {
        // Update existing Review
        const updatedReview = await Review.findByIdAndUpdate(review._id, review, {
          new: true,
        });
        if (updatedReview) {
          reviewIds.push(updatedReview._id.toString());
        }
      } else {
        // Add new Review
        const newReview = new Review({ ...review });
        const savedReview = await newReview.save();
        reviewIds.push(savedReview._id.toString());
      }
    }

    return reviewIds;
  }

  public async addMultipleReviews(data: IReview[]): Promise<IReview[]> {
    const Review = await this.getModel();
    return Review.insertMany(data.map((review) => ({ ...review })));
  }

  public async getProductReviews(ids: string): Promise<IReview[]> {
    const Review = await this.getModel();
    return (await Review.find({ _id: { $in: ids } }).lean()) as IReview[];
  }
}
