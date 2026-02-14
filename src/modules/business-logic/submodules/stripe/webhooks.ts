import { Request, Response } from "express";
import Stripe from "stripe";
import { createNewOrder, populateOrderProducts } from "../order/helper";
import { IAddress, IOrder } from "../order/Order/order.schema";
import { orderItemsSchema } from "../order-items/OrderItem/orderItem.schema";
import { OrderItemRepository } from "../order-items/OrderItem/orderItem.repository";
import { createSelroOrder } from "../../../../integerations/selro/orders/selro-orders.service";
import { sendOrderConfirmationEmail } from "../../../../emails/order-confirmation";
const fs = require('fs');
type ExtendedSession = Stripe.Checkout.Session & {
  shipping?: {
    address: {
      city: string;
      country: string;
      line1: string;
      line2: string;
      postal_code: string;
      state: string | null;
    };
    name: string;
  };
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET!;
const allShippingOptions = {
  live: {
    shr_1PjGdmIX8yJklRTzy2o6e2ku: "Standard",
    shr_1PjGYnIX8yJklRTz4qDJG8OO: "Next day Delivery",
  },
  test: {
    shr_1PNs5NA9WnHuANozVtPiueXs: "Standard",
    shr_1PNs5NA9WnHuANozUxz5hwMN: "Next day Delivery",
  },
};
const shippingOptions: any =
  allShippingOptions.test;

export const handleWebhook = async (req: Request, res: Response) => {
  
  const currentDateTime = new Date().toISOString(); // Get the current date and time in ISO format
  
   // Append the log message to a file

   fs.appendFile('my-log-file.log', "entering webhook"+"\n", (err:any) => {
    if (err) throw err;
    console.log('Log message saved to my-log-file.log');
  });

  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).send("Missing Stripe signature header");
  }

  fs.appendFile('my-log-file.log', "signature is done"+"\n", (err:any) => {
    if (err) throw err;
    console.log('Log message saved to my-log-file.log');
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  fs.appendFile('my-log-file.log', event.type+"\n", (err:any) => {
    if (err) throw err;
    console.log('Log message saved to my-log-file.log');
  });

  if (event.type === "checkout.session.completed" || event.type === "payment_intent.payment_failed") {
    const session = event.data.object as ExtendedSession;
    if (!session) return;

    const shipping = {
      rate: session.shipping_cost?.shipping_rate as string,
      name: shippingOptions[session.shipping_cost?.shipping_rate as any] || "",
      amount: session.shipping_cost?.amount_total || 0,
    };

    const { user_id, connectionKey, orderNumber } = session.metadata || {};
    const subtotal = Number(session.amount_subtotal || 0);
    const total = Number(session.amount_total || 0);
    fs.appendFile('my-log-file.log', JSON.stringify(session)+"\n", (err:any) => {
      if (err) throw err;
      console.log('Log message saved to my-log-file.log');
    });
    if (
      !user_id ||
      !orderNumber ||
      isNaN(subtotal) ||
      isNaN(total) ||
      !connectionKey
    ) {
      console.error("Missing required session data");
      return;
    }

    const order: Partial<IOrder> = {
      orderNumber,
      subtotal,
      total,
      shippingRate: shipping.rate,
      shippingMethod: shipping.name,
      shipping: shipping.amount,
      currencyCode: "GBP",
      purchaseDate: session.created,
      address: session.shipping?.address as IAddress,
      buyerName: session.customer_details?.name || "",
      buyerEmail: session.customer_details?.email || "",
      buyerPhone: session.customer_details?.phone || "",
      paymentStatus: session.payment_status,
      status: session.status as string,
      user_id,
    };

    fs.appendFile('my-log-file.log', "order to be created"+ JSON.stringify(order)+"\n", (err:any) => {
      if (err) throw err;
      console.log('Log message saved to my-log-file.log');
    });
    try {
      const createdOrder = await createNewOrder(order, connectionKey);
      const orderItemRepository = new OrderItemRepository(
        connectionKey,
        orderItemsSchema,
        "OrderItem"
      );

      await orderItemRepository.updateOrderItemsOnOrderCreation(
        user_id,
        JSON.parse(session.metadata?.skus || "[]"),
        createdOrder._id,
        orderNumber
      );

      const populatedOrder = await populateOrderProducts(
        createdOrder,
        connectionKey,
        user_id
      );

      await orderItemRepository.clearCart(user_id);
      fs.appendFile('my-log-file.log',"populatedOrder"+ JSON.stringify(populatedOrder)+"\n", (err:any) => {
        if (err) throw err;
        console.log('Log message saved to my-log-file.log');
      });
      if (order.buyerEmail) {
        await sendOrderConfirmationEmail(order.buyerEmail, populatedOrder);
      }
      if (process.env.NODE_ENV === "production") {
        await createSelroOrder(populatedOrder);
      }
    } catch (err: any) {
      fs.appendFile('my-log-file.log', "errrror"+err+"\n", (err:any) => {
        if (err) throw err;
        console.log('Log message saved to my-log-file.log');
      });
      console.error(err);
    }
  } else {
    fs.appendFile('my-log-file.log', `Unhandled event type ${event.type}`+"\n", (err:any) => {
      if (err) throw err;
      console.log('Log message saved to my-log-file.log');
    });
    console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
