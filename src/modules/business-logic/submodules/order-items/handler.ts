import { Response } from "express";
import { HttpError } from "../../../../utils/httpError";
import { OrderItemRepository } from "./OrderItem/orderItem.repository";
import { orderItemsSchema } from "./OrderItem/orderItem.schema";
import { VariationGroupRepository } from "../variation-groups/VariationGroup/variationGroup.repository";
import {
  IVariationGroup,
  variationGroupSchema,
} from "../variation-groups/VariationGroup/variationGroup.schema";
import { ProductsRepository } from "../products/Product/product.repository";
import { ProductSchema } from "../products/Product/product.schema";

export const handleGetUserOrderItemsInCart = async (
  req: any,
  res: Response
) => {
  try {
    if (!req.user._id) throw new HttpError(400, "User ID is required");
    const orderItemRepository = new OrderItemRepository(
      req.connectionKey,
      orderItemsSchema,
      "OrderItem"
    );
    const cart = await orderItemRepository.getUserOrderItemsInCart(
      req.user._id
    );
    res.status(200).json({ cart });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
export const handleGetUserCartItems = async (req: any, res: Response) => {
  try {
    if (!req.user._id) throw new HttpError(401, "User ID is required");

    const orderItemRepository = new OrderItemRepository(
      req.connectionKey,
      orderItemsSchema,
      "OrderItem"
    );
    const variationGroupRepository = new VariationGroupRepository(
      req.connectionKey,
      variationGroupSchema,
      "VariationGroup"
    );

    const productRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );

    const cartItems = await orderItemRepository.getUserOrderItemsInCart(
      req.user._id
    );

    const populatedCartItems = await Promise.all(
      cartItems.map(async (item) => {
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
          thumpnail: item.thumpnail,
        };
      })
    );

    res.status(200).json({ items: populatedCartItems });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const handleGetUserCartCount = async (req: any, res: Response) => {
  try {
    if (!req.user._id) throw new HttpError(401, "No cart user found.");

    const orderItemRepository = new OrderItemRepository(
      req.connectionKey,
      orderItemsSchema,
      "OrderItem"
    );
    const count = await orderItemRepository.getUserCartItemCount(req.user._id);
    res.status(200).json({ count });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
export const handleAddProductToCart = async (req: any, res: Response) => {
  try {
    const { sku, product_id } = req.params;
    if (!req.user._id) throw new HttpError(401, "No cart user found");

    const orderItemRepository = new OrderItemRepository(
      req.connectionKey,
      orderItemsSchema,
      "OrderItem"
    );

    await orderItemRepository.addItemToCart(req.user._id, sku, product_id);
    res.status(200).json({ message: "Product added to cart" });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const handleClearCart = async (req: any, res: Response) => {
  try {
    if (!req.user._id) throw new HttpError(400, "User ID is required");

    const orderItemRepository = new OrderItemRepository(
      req.connectionKey,
      orderItemsSchema,
      "OrderItem"
    );
    await orderItemRepository.clearCart(req.user._id);
    res.status(200).json({ message: "Cart cleared" });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
export const handleRemoveProductFromCart = async (req: any, res: Response) => {
  try {
    const { sku } = req.params;
    if (!req.user._id) throw new HttpError(400, "User ID is required");
    if (!sku) throw new HttpError(400, "Produt ID is required");

    const orderItemRepository = new OrderItemRepository(
      req.connectionKey,
      orderItemsSchema,
      "OrderItem"
    );
    await orderItemRepository.removeItemFromCart(req.user._id, sku);
    res.status(200).json({ message: "Product removed from cart" });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const handleUpdateItemQuantity = async (req: any, res: Response) => {
  try {
    const { sku, quantity } = req.params;
    if (!req.user._id) throw new HttpError(400, "User ID is required");
    if (!sku) throw new HttpError(400, "Produt ID is required");
    if (!quantity) throw new HttpError(400, "Quantity is required");

    const orderItemRepository = new OrderItemRepository(
      req.connectionKey,
      orderItemsSchema,
      "OrderItem"
    );
    if (quantity === "0") {
      await orderItemRepository.removeItemFromCart(req.user._id, sku);
      res.status(200).json({ message: "Product removed from cart" });
      return;
    }
    await orderItemRepository.updateItemQuantity(req.user._id, sku, quantity);
    res.status(200).json({ message: "Product removed from cart" });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
