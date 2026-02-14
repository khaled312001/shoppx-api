import { Router } from "express";
import {
  handleAddProductToCart,
  handleUpdateItemQuantity,
  handleClearCart,
  handleGetUserCartCount,
  handleGetUserCartItems,
  handleRemoveProductFromCart,
  handleGetUserOrderItemsInCart,
} from "./handler";

const orderItemRouter = Router();

orderItemRouter.get("/user", handleGetUserOrderItemsInCart);
orderItemRouter.get("/user/items", handleGetUserCartItems); // cart but items array is poulated
orderItemRouter.get("/count", handleGetUserCartCount);

orderItemRouter.post("/add/:product_id/:sku", handleAddProductToCart);
orderItemRouter.put("/user/:sku/:quantity", handleUpdateItemQuantity);

orderItemRouter.delete("/user", handleClearCart);
orderItemRouter.delete("/user/:sku", handleRemoveProductFromCart);


export default orderItemRouter;
