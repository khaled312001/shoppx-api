import { Router } from "express";
import {
  handleGetOrder,
  handleGetCurrentUserOrders,
  handleUpdateOrder,
  handleGetAllOrders,
} from "./handler";

export const orderRouter = Router();

// orders are created in the stripe webhook after a successful payment

// middleware to check if the user is authorized to view the order is in the handler ln: 18
orderRouter.get("/:orderNumber", handleGetOrder);
orderRouter.get("/user/:user_id", handleGetCurrentUserOrders);
orderRouter.put("/:orderNumber", handleUpdateOrder);

orderRouter.get("/", handleGetAllOrders);
