import { Response } from "express";
import { CategorySchema } from "./Category/category.schema";
import { CategoryRepository } from "./Category/category.repository";
import { populateChildren } from "./helper";
import { HttpError } from "../../../../utils/httpError";

export const getPopulatedParentCategories = async (req: any, res: Response) => {
  try {
    const categoryRepository = new CategoryRepository(
      req.connectionKey,
      CategorySchema,
      "Category"
    );
    const parentCategories =
      await categoryRepository.findActiveParentCategories();

    const categories = await populateChildren(
      req.connectionKey,
      parentCategories
    );

    res.status(200).json({ categories });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllCategories = async (req: any, res: Response) => {
  try {
    const categoryRepository = new CategoryRepository(
      req.connectionKey,
      CategorySchema,
      "Category"
    );
    const categories = await categoryRepository.findAllCategories();
    res.status(200).json({ categories });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryByKey = async (req: any, res: Response) => {
  try {
    const { key, value } = req.params;
    if (!key || !value) {
      throw new HttpError(400, "Key and value are required");
    }
    const categoryRepository = new CategoryRepository(
      req.connectionKey,
      CategorySchema,
      "Category"
    );
    const category = await categoryRepository.findCategoryByKey(key, value);
    if (!category) {
      throw new HttpError(404, "Category not found");
    }
    const children = await categoryRepository.findCategoriesWithIds(
      category.childrenIds
    );
    res.status(200).json({ category: { ...category, children } });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getCategoryChildren = async (req: any, res: Response) => {
  try {
    const { categoryIds } = req.body;
    if (!categoryIds) {
      throw new HttpError(400, "Category ids are required");
    }
    const categoryRepository = new CategoryRepository(
      req.connectionKey,
      CategorySchema,
      "Category"
    );
    const categories = await categoryRepository.findCategoriesWithIds(
      categoryIds
    );

    res.status(200).json({ categories });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
export const addCategory = async (req: any, res: Response) => {
  try {
    if (!req.body.category) {
      throw new HttpError(400, "Category data is required");
    }
    const categoryRepository = new CategoryRepository(
      req.connectionKey,
      CategorySchema,
      "Category"
    );
    const category = await categoryRepository.addCategory(req.body.category);
    res.status(200).json({ category });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategoryById = async (req: any, res: Response) => {
  try {
    const { _id } = req.params;
    if (!_id || !req.body.category) {
      throw new HttpError(400, "Category id and category data are required");
    }
    const categoryRepository = new CategoryRepository(
      req.connectionKey,
      CategorySchema,
      "Category"
    );
    const category = await categoryRepository.updateCategoryById(
      _id,
      req.body.category
    );
    res.status(200).json({ category });
  } catch (e: any) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// mongoose handles the error if the status passed is not supported
export const updateCategoryStatus = async (req: any, res: Response) => {
  try {
    const { _id, status } = req.params;
    if (!_id || !status) {
      throw new HttpError(400, "Category id and status are required");
    }
    const categoryRepository = new CategoryRepository(
      req.connectionKey,
      CategorySchema,
      "Category"
    );
    const category = await categoryRepository.updateCategoryById(_id, {
      status,
    });
    res.status(200).json({ category });
  } catch (e: any) {
    res.status(e.status || 500).json({ message: e.message });
  }
};
