import { IOrder } from "../../../modules/business-logic/submodules/order/Order/order.schema";
import { createSelroOrderDto } from "./selro-orders.dto";
const fs = require('fs');

export interface SelroOrder extends IOrder {
  items: any;
}
export const createSelroOrder = async (orderData: SelroOrder) => {
  const order = createSelroOrderDto(orderData);
  const secret = process.env.SELRO_API_SECRET || "0647910b-d6f8-4d73-80fc-47b7e76a3daf";
  const key = process.env.SELRO_API_KEY || "f08b593b-fd0d-4edc-8893-4370ff8fdbed";

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
  fs.appendFile('my-log-file.log', "selro res" + JSON.stringify(data) + "       " + JSON.stringify(order) + "\n", (err: any) => {
    if (err) throw err;
    console.log('Log message saved to my-log-file.log');
  });
  console.log("SELRO RESPONSE", data);
};
