import { differenceInHours, parse, isAfter } from "date-fns";
import { toZonedTime, format, fromZonedTime } from "date-fns-tz";

import { OrderRepository } from "./Order/order.repository";
import { IOrder, orderSchema } from "./Order/order.schema";
import { OrderItemRepository } from "../order-items/OrderItem/orderItem.repository";
import { VariationGroupRepository } from "../variation-groups/VariationGroup/variationGroup.repository";
import { ProductsRepository } from "../products/Product/product.repository";
import { orderItemsSchema } from "../order-items/OrderItem/orderItem.schema";
import {
  IVariationGroup,
  variationGroupSchema,
} from "../variation-groups/VariationGroup/variationGroup.schema";
import { ProductSchema } from "../products/Product/product.schema";
const fs = require('fs');

export const createNewOrder = async (
  orderData: Partial<IOrder>,
  connectionKey: string
) => {
  const orderRepository = new OrderRepository(
    connectionKey,
    orderSchema,
    "Order"
  );
  const order = await orderRepository.addOrder(orderData);
  return order;
};

export const handleOrderCancellation = (
  order: IOrder,
  currentUKTime: Date = getCurrentUKTime()
) => {
  if (order.status !== "pending") {
    throw new Error("Order cannot be cancelled");
  }

  const purchaseDate = new Date(order.purchaseDate);
  const ukTimeZone = "Europe/London";

  // Convert purchase date and current time to UK time
  const purchaseDateUK = toZonedTime(purchaseDate, ukTimeZone);
  const currentTimeUK = toZonedTime(currentUKTime, ukTimeZone);

  // Check if 24 hours have passed
  const hoursPassed = differenceInHours(currentTimeUK, purchaseDateUK);

  if (hoursPassed >= 24) {
    throw new Error("Order cancellation period has expired");
  }

  // Check if it's past 2 PM for orders purchased before 2 PM
  const purchaseTime = parse(
    format(purchaseDateUK, "HH:mm"),
    "HH:mm",
    new Date()
  );
  const twoPM = parse("14:00", "HH:mm", new Date());

  if (isAfter(purchaseTime, twoPM) || isAfter(currentTimeUK, twoPM)) {
    // Allow cancellation
    return true;
  } else {
    throw new Error(
      "Cancellation not allowed before 2 PM for orders placed before 2 PM"
    );
  }
};

function getCurrentUKTime(): Date {
  const ukTimeZone = "Europe/London";
  const now = new Date();
  return fromZonedTime(now, ukTimeZone);
}

export const populateOrderProducts = async (
  order: IOrder,
  connectionKey: string,
  user_id: any
) => {
  const orderItemRepository = new OrderItemRepository(
    connectionKey,
    orderItemsSchema,
    "OrderItem"
  );

  const variationGroupRepository = new VariationGroupRepository(
    connectionKey,
    variationGroupSchema,
    "VariationGroup"
  );

  const productRepository = new ProductsRepository(
    connectionKey,
    ProductSchema,
    "Product"
  );
  const items = await orderItemRepository.getOrderItems(
    order.orderNumber,
    user_id
  );

  const populatedOrderItems = await Promise.all(
    items.map(async (item) => {
      const product = await productRepository.findProductById(
        item.product_id.toString()
      );
      if (!product.variationGroupId) {
        // const product = await productRepository.findProductById(
        //   item.product_id.toString()
        // );
        return {
          name: product.name,
          thumpnail: product.thumpnail,
          sku: product.sku,
          price: product.price,
          quantity: item.quantity,
          product_id: product._id,
          _id: item._id,
        };
      }
      const variationGroup =
        (await variationGroupRepository.findVariationGroupById(
          product.variationGroupId.toString()
        )) as IVariationGroup;
      const variation = variationGroup?.variations.find(
        (v) => v.sku === item.sku
      );

      if (variation) {
        let variationName = '';
        variationName = variation!.otherSpecifications?.length > 0 ? [
          variation!.otherSpecifications.find(
            (s: any) => s.name.toLowerCase() === "size"
          )?.value,
          variation!.otherSpecifications.find(
            (s: any) => s.name.toLowerCase() === "colour"
          )?.value,
        ].filter(s => s !== undefined)
          .join(" + ")
          .replace(",", "") : '';

          return {
            product_id: item.product_id,
            _id: item._id,
            ...variation,
            quantity: item.quantity,
            name: product.name + ' ' + variationName,
            thumpnail: variation?.images[0] || product.thumpnail,
          };
      }else{
        return {
          name: product.name,
          thumpnail: product.thumpnail,
          sku: product.sku,
          price: product.price,
          quantity: item.quantity,
          product_id: product._id,
          _id: item._id,
        };
      }

     
    })
  );

  return { ...order, items: populatedOrderItems };
};

export const populateOrderSProducts = async (
  orders: IOrder[],
  connectionKey: string
) => {
  const variationGroupRepository = new VariationGroupRepository(
    connectionKey,
    variationGroupSchema,
    "VariationGroup"
  );

  const productRepository = new ProductsRepository(
    connectionKey,
    ProductSchema,
    "Product"
  );

  const populatedOrders = await Promise.all(
    orders.map(async (order: any) => {
      const populatedItems = await Promise.all(
        order.items.map(async (item: any) => {
          if (!item.variationGroupId) {
            const product = await productRepository.findProductById(
              item.product_id.toString()
            );
            return {
              name: product.name,
              thumpnail: product.thumpnail,
              sku: product.sku,
              price: product.price,
              quantity: item.quantity,
              product_id: product._id,
              _id: item._id,
            };
          }
          const variationGroup =
            (await variationGroupRepository.findVariationGroupById(
              item.variationGroupId.toString()
            )) as IVariationGroup;
          const variation = variationGroup?.variations.find(
            (v) => v.sku === item.sku
          );
          return {
            product_id: item.product_id,
            _id: item._id,
            ...variation,
            quantity: item.quantity,
            name: item.name,
            thumbnail: item.thumbnail,
          };
        })
      );
      return { ...order, items: populatedItems };
    })
  );

  return populatedOrders;
};
