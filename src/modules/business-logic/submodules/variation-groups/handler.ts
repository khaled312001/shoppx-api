import { Response } from "express";
import { VariationGroupRepository } from "./VariationGroup/variationGroup.repository";
import { variationGroupSchema } from "./VariationGroup/variationGroup.schema";
import { ProductsRepository } from "../products/Product/product.repository";
import { ProductSchema } from "../products/Product/product.schema";

export const handleAddNewVariationGroup = async (req: any, res: Response) => {
  try {
    const { variationGroup } = req.body;

    if (!variationGroup) {
      return res.status(400).send("Bad Request");
    }

    const variationGroupRepository = new VariationGroupRepository(
      req.connectionKey,
      variationGroupSchema,
      "VariationGroup"
    );

    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );

    const newVariationGroup = await variationGroupRepository.addVariationGroup(
      variationGroup
    );

    if (newVariationGroup.product_id) {
      await productsRepository.updateProduct(newVariationGroup.product_id, {
        variationGroupId: newVariationGroup._id,
      });
    }

    res.status(201).json({ variationGroup: newVariationGroup });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const handleUpdateVariationGroup = async (req: any, res: Response) => {
  try {
    const { variationGroup } = req.body;
    const { _id } = req.params;
console.log("variationGroup",JSON.stringify(variationGroup))
    if (!_id || !variationGroup) {
      return res
        .status(400)
        .json({ message: "Bad Request _id and data are required" });
    }

    const variationGroupRepository = new VariationGroupRepository(
      req.connectionKey,
      variationGroupSchema,
      "VariationGroup"
    );

    const updatedVariationGroup =
      await variationGroupRepository.updateVariationGroup(variationGroup, _id);

    res.status(201).json({ variationGroup: updatedVariationGroup });
  } catch (error: any) {
    console.log(error.message ?? "H");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const handleGetVariationGroup = async (req: any, res: Response) => {
  try {
    const { _id } = req.params;
    if (!_id) {
      return res.status(400).send("Bad Request");
    }

    const variationGroupRepository = new VariationGroupRepository(
      req.connectionKey,
      variationGroupSchema,
      "VariationGroup"
    );

    const variationGroup =
      await variationGroupRepository.findVariationGroupById(_id);

    res.status(200).json({ variationGroup });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
