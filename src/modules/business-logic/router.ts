import { Router } from "express";
import productsRouter from "./submodules/products/router";
import categoriesRouter from "./submodules/categories/router";
import { verifyUser } from "../../middleware/authentication.middleware";
import { faqsRouter } from "./submodules/faqs/router";
import { orderRouter } from "./submodules/order/router";
import wishlistRouter from "./submodules/wishlist/router";
import productSpecificationsRouter from "./submodules/product-specifications/router";
import variationGroupsRouter from "./submodules/variation-groups/router";
import { warrantyFormRouter } from "./submodules/warranty-form/router";
import orderItemRouter from "./submodules/order-items/router";
import { blogsRouter } from "./submodules/blogs/router";
import { concactRouter } from "./submodules/contact/router";
import reviewsRouter from "./submodules/reviews/router";
import messagesRouter from "./submodules/conversations/router";

const businessLogicRouter = Router();

businessLogicRouter.use("/categories", categoriesRouter);
businessLogicRouter.use("/products", productsRouter);
businessLogicRouter.use("/faqs", faqsRouter);
businessLogicRouter.use("/reviews", reviewsRouter);
businessLogicRouter.use("/wishlist", verifyUser, wishlistRouter);
businessLogicRouter.use("/messages", verifyUser, messagesRouter);
businessLogicRouter.use("/product-specifications", productSpecificationsRouter);
businessLogicRouter.use("/variation-groups", variationGroupsRouter);
businessLogicRouter.use("/warranties", verifyUser, warrantyFormRouter);
businessLogicRouter.use("/orders", verifyUser, orderRouter);
businessLogicRouter.use("/orderItems", verifyUser, orderItemRouter);
businessLogicRouter.use("/blogs", blogsRouter);
businessLogicRouter.use("/contact", concactRouter);

export default businessLogicRouter;
