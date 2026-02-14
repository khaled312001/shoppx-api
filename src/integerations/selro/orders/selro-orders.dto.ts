import { json } from "body-parser";
import { SelroOrder } from "./selro-orders.service";
const fs = require('fs');
export const createSelroOrderDto = (orderData: SelroOrder) => {
  const channelSales = orderData.items.map((item: any) => {

    return {
      qty: item.quantity,
      title: item.name,
      sku: item.sku,
      ean: item.ean,
      price: item.price,
      totalPrice: item.price,
      imageUrl: item.thumpnail,
      inventorysku: item.sku,
      weight: item.weight,
    };
  });

  return {
    orderId: orderData.orderNumber,
    status: orderData.status,
    shipPostalCode: orderData.address.postal_code,
    shipAddress1: orderData.address.line1,
    shipAddress2: orderData.address.line2,
    subTotal: orderData.subtotal,
    total: orderData.total,
    shipping: orderData.shipping,
    shipCountryCode: orderData.currencyCode,
    shipCity: orderData.address.city,
    shipCountry: orderData.address.country,
    shipState: orderData.address.state,
    shipName: orderData.buyerName,
    shipPhoneNumber: orderData.buyerPhone,
    channelSales,
    channelId: 32280,
  };
};
