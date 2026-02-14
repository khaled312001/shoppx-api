import { Connection, Model, Schema, Types } from "mongoose";
import {
  getModel,
  getTenantConnection,
  registerModel,
} from "../../../../../database";
import { IOrder } from "./order.schema";
import {
  IOrderItem,
  orderItemsSchema,
} from "../../order-items/OrderItem/orderItem.schema";
import { userSchema } from "../../../../user/User/user.schema";

export class OrderRepository {
  private connectionKey: string;
  private modelName: string;
  private schema: Schema;

  constructor(connectionKey: string, schema: Schema, modelName: string) {
    this.connectionKey = connectionKey;
    this.modelName = modelName || "Order";
    this.schema = schema;
  }

  private async getModel(): Promise<Model<IOrder>> {
    await registerModel(this.connectionKey, "User", userSchema);
    return await getModel(this.connectionKey, this.modelName, this.schema);
  }
  private async getOrderItemModel(): Promise<Model<IOrderItem>> {
    const conn: Connection = await getTenantConnection(this.connectionKey);
    return conn.model<IOrderItem>("OrderItem", orderItemsSchema);
  }

  // Repository GET methods
  public async addOrder(order: Partial<IOrder>): Promise<IOrder> {
    const Order = await this.getModel();
    return await new Order(order).save().then((doc) => doc.toObject());
  }

  public async getById(orderNumber: string): Promise<IOrder | null> {
    const Order = await this.getModel();
    // Fetch the order
    const order = await Order.findOne({ orderNumber }).lean();
    return order;
  }
  public async getUserOrdersWithItems(
    user_id: string | Types.ObjectId
  ): Promise<IOrder[]> {
    const Order = await this.getModel();
    const OrderItem = await this.getOrderItemModel();

    // Convert user_id to ObjectId if it's a string
    const objectIdUserId =
      typeof user_id === "string" ? new Types.ObjectId(user_id) : user_id;

    // Fetch all orders for the user with their items in a single query
    const orders = await Order.aggregate([
      { $match: { user_id: objectIdUserId } },
      {
        $lookup: {
          from: OrderItem.collection.name,
          localField: "_id",
          foreignField: "order_id",
          as: "items",
        },
      },
      { $sort: { purchaseDate: -1 } }, // Sort by purchaseDate in descending order
    ]).exec();

    return orders;
  }

  public async updateOrder(
    orderNumber: string,
    order: Partial<IOrder>
  ): Promise<any> {
    const Order = await this.getModel();
    return await Order.findOneAndUpdate({ orderNumber }, order, { new: true });
  }

  public async getAllOrders(
    page: number,
    pageSize: number = 20
  ): Promise<{ orders: IOrder[]; count: number; totalPages: number }> {
    const Order = await this.getModel();

    const skip = (page - 1) * pageSize;

    const count = await Order.countDocuments();

    const totalPages = Math.ceil(count / pageSize);

    const orders = await Order.find()
      .skip(skip)
      .limit(pageSize)
      .populate("user_id")
      .lean();

    return { orders, count, totalPages };
  }
}
