import { Router } from "express";
import { handleGetProductFaqs } from "./handler";

export const faqsRouter = Router();
faqsRouter.post("/", handleGetProductFaqs);
