import { Request, Response } from "express";
import Stripe from "stripe";
import { generateOrderNumber } from "../../../../utils/uuid";
import { OrderItemRepository } from "../order-items/OrderItem/orderItem.repository";
import { orderItemsSchema } from "../order-items/OrderItem/orderItem.schema";
const fs = require('fs');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

const DOMAIN = process.env.DOMAIN!;
const allShippingOptions = {
  test: [
    { shipping_rate: "shr_1PNs5NA9WnHuANozVtPiueXs" },
    { shipping_rate: "shr_1PNs5NA9WnHuANozUxz5hwMN" },
  ],
  live: [
    { shipping_rate: "shr_1PjGdmIX8yJklRTzy2o6e2ku" },
    { shipping_rate: "shr_1PjGYnIX8yJklRTz4qDJG8OO" },
  ],
};
const shipping_options =
  process.env.NODE_ENV === "production"
    ? allShippingOptions.live
    : allShippingOptions.test;

    
export const handleCreateCheckoutSession = async (
  req: Request,
  res: Response
) => {
  const { items, total, user_id, connectionKey } = req.body;
  if (!items || items.length === 0 || !total || !user_id) {
    return res
      .status(400)
      .json({ message: "Bad Request: items, total, user_id are required" });
  }

  if (items.length === 1) {
    const orderItemRepository = new OrderItemRepository(
      connectionKey,
      orderItemsSchema,
      "OrderItem"
    );
    await orderItemRepository.addItemToCart(
      user_id,
      items[0].sku,
      items[0]._id,
      items[0].quantity || 1,
      true
    );
  }
  fs.appendFile('my-log-file.log', "itemssss " + JSON.stringify(items)+"\n", (err:any) => {
    if (err) throw err;
    console.log('Log message saved to my-log-file.log');
  });
  const orderNumber = generateOrderNumber(user_id);
  const line_items = items.map((item: any) => ({
    price_data: {
      currency: process.env.NODE_ENV === "production" ? "gbp" : "usd",
      product_data: {
        id: item.id,
        images: [item.thumbnail],
        description: item.description,
        name: item.name,
      },
      unit_amount: Math.ceil((item.discount && item.discount > 0 ? item.discount : item.price) * 100),
      // unit_amount: 0,
    },
    quantity: item.quantity || 1,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      line_items,
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["GB"] },
      billing_address_collection: "required",
      shipping_options,
      mode: "payment",
      success_url: `${DOMAIN}/account/orders/${orderNumber}?success=true`,
      cancel_url: `${DOMAIN}/account/orders/${orderNumber}?cancelled=true`,
      metadata: {
        orderNumber,
        user_id,
        total,
        connectionKey,
        skus: JSON.stringify(items.map((item: any) => item.sku) || []),
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
