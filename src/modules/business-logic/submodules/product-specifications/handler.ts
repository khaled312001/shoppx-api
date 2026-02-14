import { Response } from "express";
import { SpecificationRepository } from "./ProductSpecifications/productSpecifications.repository";
import { productSpecificationSchema } from "./ProductSpecifications/productSpecifications.schema";
import { HttpError } from "../../../../utils/httpError";

export const handleGetSpecifications = async (req: any, res: Response) => {
  try {
    const specificationRepository = new SpecificationRepository(
      req.connectionKey,
      productSpecificationSchema,
      "product_specifications"
    );
    const specifications = await specificationRepository.findSpecifications();
    return res.status(200).json({ specifications });
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
export const handleAddNewSpecifications = async (req: any, res: Response) => {
  try {
    const { specifications } = req.body;
    if (!specifications || !specifications.length)
      throw new HttpError(400, "Specifications are required");
    const specificationRepository = new SpecificationRepository(
      req.connectionKey,
      productSpecificationSchema,
      "product_specifications"
    );
    const exists = await specificationRepository.findSpecificationByname(
      specifications[0].name
    );
    if (exists) throw new HttpError(409, "Specification already exists");
    const addedSpecifications = await specificationRepository.addSpecifications(
      specifications
    );
    return res.status(201).json({ addedSpecifications });
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
export const handleUpdateSpecificationField = async (
  req: any,
  res: Response
) => {
  try {
    const { specification_id } = req.params;
    const { specification } = req.body;
    if (!specification)
      throw new HttpError(400, "Field and value are required");
    const specificationRepository = new SpecificationRepository(
      req.connectionKey,
      productSpecificationSchema,
      "product_specifications"
    );
    const updatedSpecification =
      await specificationRepository.updateSpecification(
        specification,
        specification_id
      );
    return res.status(200).json({ updatedSpecification });
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
export const handleDeleteSpecificationField = async (
  req: any,
  res: Response
) => {
  try {
    const { specification_id } = req.params;
    const specificationRepository = new SpecificationRepository(
      req.connectionKey,
      productSpecificationSchema,
      "product_specifications"
    );
    const deletedSpecification =
      await specificationRepository.deleteSpecification(specification_id);
    return res.status(200).json({ deletedSpecification });
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};