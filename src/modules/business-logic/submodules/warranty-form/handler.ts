import { Response } from "express";
import { WarrantyFormRepository } from "./WarrantyForm/warrantyForm.repository";
import { warrantyFormSchema } from "./WarrantyForm/warrantyForm.schema";
import { HttpError } from "../../../../utils/httpError";
import { OrderRepository } from "../order/Order/order.repository";
import { orderSchema } from "../order/Order/order.schema";
import { sendOrderTestConfirmationEmail } from "../../../../emails/order-test";
const fs = require('fs');

export const handleAddWarrantyForm = async (req: any, res: Response) => {
  try {
    const { warranty } = req.body;

    if (!warranty) {
      throw new HttpError(400, "Warranty form data is required");
    }

    const warrantyFormRepository = new WarrantyFormRepository(
      req.connectionKey,
      warrantyFormSchema,
      "WarrantyForm"
    );

    const orderRepository = new OrderRepository(
      req.connectionKey,
      orderSchema,
      "orders"
    );

    const warrantyFormData = {
      ...warranty,
      user_id: req.user._id,
    };

    const warrantyForm = await warrantyFormRepository.addWarrantyForm(
      warrantyFormData
    );

    if (warranty.order_id) {
      await orderRepository.updateOrder(warranty.orderNumber, {
        warranty_id: warrantyForm._id,
      });
    }

    res.status(200).json({ warrantyForm });
  } catch (err: any) {
    console.log(err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal server error" });
  }
};

export const handleGetUserWarranties = async (req: any, res: Response) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      throw new HttpError(400, "User id is required");
    }
    if (user_id !== req.user._id) {
      throw new HttpError(401, "Unauthorized access");
    }
    const warrantyFormRepository = new WarrantyFormRepository(
      req.connectionKey,
      warrantyFormSchema,
      "WarrantyForm"
    );

    const warranties = await warrantyFormRepository.getUserWarranties(
      req.user._id
    );

    res.status(200).json({ warranties });
  } catch (err: any) {
    console.log(err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal server error" });
  }
};


export const handleGetAllWarranties = async (req: any, res: Response) => {
  try {
   
    const warrantyFormRepository = new WarrantyFormRepository(
      req.connectionKey,
      warrantyFormSchema,
      "WarrantyForm"
    );
    const warranties = await warrantyFormRepository.getAllWarranties();

    res.status(200).json({ warranties });
  } catch (err: any) {
    console.log(err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal server error" });
  }
};