import { Router } from "express";
import {
  handleGetPaginatedProducts,
  handleGetProductWithid,
  handleUpdateProduct,
  handleGetProductWithName,
  handleGetProductWithSearch,
  handleNewProduct,
  handleGetProductsByCategoryIds,
  handleGetProductsByIds,
  handleGetFilteredProducts,
  handleGetPopularProducts
} from "./handler";

const productsRouter = Router();

productsRouter.get("/", handleGetPaginatedProducts);
productsRouter.get("/popular/:limit", handleGetPopularProducts);

productsRouter.post (
  "/categories/:category_slug?/:subcategory_slug?/:query?",
  handleGetFilteredProducts
);
// get products by category ids
productsRouter.get("/:id", handleGetProductWithid);
productsRouter.get("/name/:name", handleGetProductWithName);
productsRouter.get("/search/:query", handleGetProductWithSearch);
productsRouter.post("/similar", handleGetProductsByCategoryIds);
productsRouter.post("/ids", handleGetProductsByIds);

productsRouter.put("/:id", handleUpdateProduct);
productsRouter.post("/new", handleNewProduct);


export default productsRouter;
