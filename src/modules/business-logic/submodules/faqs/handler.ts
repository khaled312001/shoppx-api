import { Response } from "express";
import { FaqRepository } from "./FAQ/faq.repository";
import { faqSchema } from "./FAQ/faq.schema";
import { HttpError } from "../../../../utils/httpError";

export const handleGetProductFaqs = async (req: any, res: Response) => {
  const { ids } = req.body;
  try {
    if (!ids) {
      throw new HttpError(400, "Product id is required");
    }
    const faqsReposityory = new FaqRepository(
      req.connectionKey,
      faqSchema,
      "FAQ"
    );
    const faqs = await faqsReposityory.getProductFaqs(ids);
    res.status(200).json({ faqs });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
