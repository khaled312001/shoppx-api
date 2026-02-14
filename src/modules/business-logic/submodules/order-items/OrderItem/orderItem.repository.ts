import { Schema } from "mongoose";
import { getModel } from "../../../../../database";
import { IOrderItem } from "./orderItem.schema";
const fs = require('fs');

export class OrderItemRepository {
  private connectionKey: string;
  private modelName: string;
  private schema: Schema;

  constructor(connectionKey: string, schema: Schema, modelName: string) {
    this.connectionKey = connectionKey;
    this.modelName = modelName || "OrderItem";
    this.schema = schema;
  }

  private async getModel() {
    return await getModel(this.connectionKey, this.modelName, this.schema);
  }

  public async updateOrderItemsOnOrderCreation(
    user_id: string,
    skus: string[],
    orderId: string,
    orderNumber: string
  ) {
    const OrderItem = await this.getModel();
    const updateResult = await OrderItem.updateMany(
      {
        user_id: user_id,
        sku: { $in: skus },
        $or: [
          { order_id: { $exists: false } },
          { order_id: null },
          { orderNumber: { $exists: false } },
          { orderNumber: null },
        ],
      },
      {
        $set: {
          order_id: orderId,
          orderNumber: orderNumber,
        },
      }
    );
    return updateResult;
  }

  public async getOrderItems(
    orderNumber: string,
    user_id: string
  ): Promise<IOrderItem[]> {
    const OrderItem = await this.getModel();
    return await OrderItem.find({ orderNumber, user_id }).lean();
  }

  public async getOrdersItems(
    order_ids: string[],
    user_id: string
  ): Promise<IOrderItem[]> {
    const OrderItem = await this.getModel();
    return await OrderItem.find({
      order_id: { $in: order_ids },
      user_id,
    }).lean();
  }

  public async getUserOrderItemsInCart(user_id: string): Promise<IOrderItem[]> {
    const OrderItem = await this.getModel();
    return await OrderItem.find({
      user_id,
      $or: [
        { orderNumber: { $exists: false } },
        { orderNumber: null },
        { order_id: { $exists: false } },
        { order_id: null },
      ],
    }).lean();
  }

  public async getUserCartItemCount(user_id: string): Promise<number> {
    const OrderItem = await this.getModel();
    return await OrderItem.countDocuments({
      user_id,
      $or: [
        { orderNumber: { $exists: false } },
        { orderNumber: null },
        { order_id: { $exists: false } },
        { order_id: null },
      ],
    });
  }
// quantity: number = 1
  public async addItemToCart(
    user_id: string,
    sku: string,
    product_id: string,
    quantity: number = 1,
    orderCreated?: boolean
  ) {
    const OrderItem = await this.getModel();

    // Check if the item already exists in the cart
    const existingItem = await OrderItem.findOne({
      user_id,
      sku,
      $or: [
        { order_id: { $exists: false } },
        { order_id: null },
        { orderNumber: { $exists: false } },
        { orderNumber: null },
      ],
    });

    if (existingItem) {
      // Update the quantity if the item exists
      if(orderCreated){
        existingItem.quantity = quantity;
      }else{
        existingItem.quantity += quantity;
      }
     
      await existingItem.save();
      return existingItem;
    } else {
      // Create a new item if it doesn't exist
      const newItem = new OrderItem({
        user_id,
        sku,
        product_id,
        quantity,
      });
      await newItem.save();
      fs.appendFile('my-log-file.log',"newItem after"+ JSON.stringify(newItem)+"\n", (err:any) => {
        if (err) throw err;
        console.log('Log message saved to my-log-file.log');
      });
      return newItem;
    }
  }

  public async updateItemQuantity(
    user_id: string,
    sku: string,
    quantity: number
  ) {
    const OrderItem = await this.getModel();
    return await OrderItem.findOneAndUpdate(
      {
        user_id,
        sku,
        $or: [
          { order_id: { $exists: false } },
          { order_id: null },
          { orderNumber: { $exists: false } },
          { orderNumber: null },
        ],
      },
      { $set: { quantity: quantity } },
      { new: true }
    );
  }

  public async clearCart(user_id: string) {
    const OrderItem = await this.getModel();
    return await OrderItem.deleteMany({
      user_id,
      $or: [
        { order_id: { $exists: false } },
        { order_id: null },
        { orderNumber: { $exists: false } },
        { orderNumber: null },
      ],
    });
  }

  public async removeItemFromCart(user_id: string, sku: string) {
    const OrderItem = await this.getModel();
    return await OrderItem.findOneAndDelete({
      user_id,
      sku,
      $or: [
        { order_id: { $exists: false } },
        { order_id: null },
        { orderNumber: { $exists: false } },
        { orderNumber: null },
      ],
    });
  }
}
