import { FaqRepository } from "./FAQ/faq.repository";
import { faqSchema, IFaq } from "./FAQ/faq.schema";

export const addFaqsAndGetIds = async (faqs: IFaq[], connectionKey: string) => {
  const faqRepository = new FaqRepository(connectionKey, faqSchema, "Faq");
  const faqIds = await faqRepository.updateFaqs(faqs);
  return faqIds;
};
