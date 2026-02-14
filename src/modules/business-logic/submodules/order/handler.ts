import { Response } from "express";
import { OrderRepository } from "./Order/order.repository";
import { orderSchema } from "./Order/order.schema";
import { populateOrderProducts, populateOrderSProducts } from "./helper";

export const handleGetOrder = async (req: any, res: Response) => {
  try {
    const { orderNumber } = req.params;
    console.log("orderNumber",orderNumber)
    const orderRepository = new OrderRepository(
      req.connectionKey,
      orderSchema,
      "orders"
    );

    const order = await orderRepository.getById(orderNumber);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const populatedOrder = await populateOrderProducts(
      order,
      req.connectionKey,
      order.user_id
    );
    const connectionFrom = req.headers["x-connection-from"]; // or req.get("x-connection-from")
  
    //@ts-ignore
    if (connectionFrom !== "super" && order.user_id.toString() !== req.user._id) {
      return res.status(401).json({ message: "Unauthorized Access" });
    }
    res.status(200).json({ order: populatedOrder });
  } catch (err: any) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const handleGetCurrentUserOrders = async (req: any, res: Response) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({ message: "User id is required" });
    }

    const orderRepository = new OrderRepository(
      req.connectionKey,
      orderSchema,
      "Order"
    );

    // Fetch orders with populated items in a single query
    const orders = (await orderRepository.getUserOrdersWithItems(
      user_id
    )) as any;

    const populatedOrders = await populateOrderSProducts(
      orders,
      req.connectionKey
    );

    res.status(200).json({ orders: populatedOrders });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send({ message: "Internal server error" });
  }
};

export const handleUpdateOrder = async (req: any, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const { data } = req.body;
    const orderRepository = new OrderRepository(
      req.connectionKey,
      orderSchema,
      "orders"
    );
    const order = await orderRepository.getById(orderNumber);

    if (!order) {
      res.status(404).send({ message: "Order not found" });
      return;
    }

    const updatedOrder = await orderRepository.updateOrder(orderNumber, data);
    res.status(200).json({ updatedOrder });
  } catch (err: any) {
    console.log(err.message);
    res.status(500).send({ message: "Internal server error" });
  }
};

export const handleGetAllOrders = async (req: any, res: Response) => {
  try {
    const { page, pageSize } = req.query;
    const orderRepository = new OrderRepository(
      req.connectionKey,
      orderSchema,
      "orders"
    );
    const { orders, count, totalPages } = await orderRepository.getAllOrders(
      page,
      pageSize
    );
    res.status(200).json({ orders, count, totalPages });
  } catch (err: any) {
    console.log(err.message);
    res.status(500).send({ message: "Internal server error" });
  }
};
