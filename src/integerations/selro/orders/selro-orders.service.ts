import { IOrder } from "../../../modules/business-logic/submodules/order/Order/order.schema";
import { createSelroOrderDto } from "./selro-orders.dto";

export interface SelroOrder extends IOrder {
  items: any;
}
export const createSelroOrder = async (orderData: SelroOrder) => {
  const order = createSelroOrderDto(orderData);
  const secret = process.env.SELRO_API_SECRET;
  const key = process.env.SELRO_API_KEY;

  if (!secret || !key) {
    console.error("SELRO_API_SECRET or SELRO_API_KEY is not set in environment variables");
    return;
  }

  try {
    const res = await fetch(
      `https://api.selro.com/6/order?secret=${secret}&key=${key}`,
      {
        method: "POST",
        body: JSON.stringify(order),
        headers: {
          "Content-Type": "application/json;charset=UTF-8"
        },
      }
    );
    const data = await res.json();
    console.log("SELRO RESPONSE", JSON.stringify(data));
    console.log("SELRO ORDER SENT", JSON.stringify(order));
  } catch (error) {
    console.error("SELRO ORDER ERROR", error);
  }
};
