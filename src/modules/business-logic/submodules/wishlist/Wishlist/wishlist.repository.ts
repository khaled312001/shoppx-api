import { Schema } from "mongoose";
import { getModel } from "../../../../../database";
import { IWishlist } from "./wishlist.schema";

export class WishlistRepository {
  private connectionKey: string;
  private modelName: string;
  private schema: Schema;

  constructor(connectionKey: string, schema: Schema, modelName: string) {
    this.connectionKey = connectionKey;
    this.modelName = modelName || "Wishlist";
    this.schema = schema;
  }

  private async getModel() {
    return await getModel(this.connectionKey, this.modelName, this.schema);
  }

  // Repository GET methods
  public async getUserWishlist(userId: string): Promise<IWishlist | null> {
    const Wishlist = await this.getModel();
    return await Wishlist.findOne({ userId }).lean();
  }

  public async addItemToWishlist(
    userId: string,
    productId: string,
    quantity: number = 1
  ) {
    const Wishlist = await this.getModel();
    const cart = await Wishlist.findOne({ userId });
    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item: any) => item.productId.toString() === productId
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;

        await cart.save();
        return cart;
      } else {
        return await Wishlist.findOneAndUpdate(
          { userId },
          { $push: { items: { productId, quantity } } },
          { new: true }
        );
      }
    } else {
      return await Wishlist.findOneAndUpdate(
        { userId },
        { $push: { items: { productId, quantity } } },
        { new: true, upsert: true }
      );
    }
  }

  public async removeItemFromWishlist(userId: string, productId: string) {
    const Wishlist = await this.getModel();
    return await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );
  }
}
