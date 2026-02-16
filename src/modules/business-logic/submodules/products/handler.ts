import { CategoryRepository } from "../categories/Category/category.repository";
import { query, Response } from "express";
import { ProductsRepository } from "./Product/product.repository";
import { ProductSchema } from "./Product/product.schema";
import { HttpError } from "../../../../utils/httpError";
import { CategorySchema } from "../categories/Category/category.schema";
import { FaqRepository } from "../faqs/FAQ/faq.repository";
import { faqSchema } from "../faqs/FAQ/faq.schema";

export const handleGetPaginatedProducts = async (req: any, res: Response) => {
  try {
    console.log("ppppp")
    const page = parseInt(req.query.page as string);
    const pageSize = parseInt(req.query.pageSize as string);
    const query = req.query.query;
    if (isNaN(page) || isNaN(pageSize)) {
      throw new HttpError(400, "Valid page and pageSize are required");
    }

    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );

    const { products, count } = await productsRepository.findPaginatedProducts(
      page,
      pageSize,
      query
    );
    console.log("products",products.length)
    console.log("count",count)
    res.status(200).json({ products, count });
  } catch (error: any) {
    console.log(error.message);
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const handleGetPopularProducts = async (req: any, res: Response) => {
  try {
    const { limit } = req.params;
    if (!limit) {
      throw new HttpError(400, "Limit is required");
    }
    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );
    const products = await productsRepository.findPopularProducts(limit);
    res.status(200).json({ products });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
export const handleGetProductsByCategoryIds = async (
  req: any,
  res: Response
) => {
  try {

    const { category_ids } = req.body;
    if (!category_ids) {
      throw new HttpError(400, "Category ids are required");
    }
    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );
    const products = await productsRepository.findCategoryProducts(
      category_ids,
      7
    );
    res.status(200).json({ products });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const handleGetProductWithid = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new HttpError(400, "Product id is required");
    }
    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );
    const product = await productsRepository.findProductById(id);
    res.status(200).json({ product });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const handleGetProductsByIds = async (req: any, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids) {
      throw new HttpError(400, "Product id is required");
    }
    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );
    const products = await productsRepository.findProductsByIds(ids);
    res.status(200).json({ products });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const handleGetProductWithName = async (req: any, res: Response) => {
  try {
    const { name } = req.params;
    if (!name) {
      throw new HttpError(400, "Product name is required");
    }
    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );
    //replace name with slug
    const product = await productsRepository.findProductBySlug(name);
    res.status(200).json({ product });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const handleGetProductWithSearch = async (req: any, res: Response) => {
  try {
    // const { query } = req.params;
    // if (!query) {
    //   throw new HttpError(400, "Product query is required");
    // }
    // const productsRepository = new ProductsRepository(
    //   req.connectionKey,
    //   ProductSchema,
    //   "Product"
    // );

    // const products = await productsRepository.findProductBySearch(query);
    const { query } = req.params;
    if (!query) {
      throw new HttpError(400, "Product query is required");
    }
    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );

    const products = await productsRepository.findProductBySearch(query);
    // console.log("products", products)
    res.status(200).json({ products });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
export const handleGetFilteredProducts = async (req: any, res: Response) => {
  try {
    console.log("ffffff")
    const { category_slug, subcategory_slug } = req.params;
    let { filters } = req.body;

    const { page, pageSize, query } = req.query;
    // if (!category_slug || !subcategory_slug)
    //   throw new HttpError(400, "Categories  are required");

    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );

    const categoryRepository = new CategoryRepository(
      req.connectionKey,
      CategorySchema,
      "Category"
    );
   
    const slugs = subcategory_slug && subcategory_slug != 'undefined' ? [subcategory_slug] :  category_slug && category_slug != 'undefined' ? [category_slug] : [];
    
    const categories = await categoryRepository.findCategoriesWithSlugs(slugs);
    let categoryIds = [];
    let filteredByCateory = false;

    if (filters && filters.length > 0) {
      const categoryFilter = filters.find((filter: { name: string; }) => filter.name === "Room");
      if (categoryFilter) {
        const categoriesFromFilter = await categoryRepository.SearchCategoriesByKeyword(categoryFilter);

        if (categoriesFromFilter) {

          let allCategories = [];
          if (categories && categories.length > 0) {
            filteredByCateory = true;

            allCategories = categories.filter(category =>
              categoriesFromFilter.some(filterCategory => filterCategory.name === category.name)
            );

            if (allCategories.length === 0) {
              allCategories = [
                ...categories,
                ...categoriesFromFilter,
              ].reduce((acc: any[], category) => {
                if (!acc.some(cat => cat._id === category._id)) {
                  acc.push(category); // Only add unique categories
                }
                return acc;
              }, []);
            }
          } else {
            allCategories = [
              ...categories,
              ...categoriesFromFilter,
            ].reduce((acc: any[], category) => {
              if (!acc.some(cat => cat._id === category._id)) {
                acc.push(category); // Only add unique categories
              }
              return acc;
            }, []);
          }

          // Extract unique category IDs for the product query
          categoryIds = allCategories.map(category => category._id.toString());
          filters = filters.filter((filter: { name: string; }) => filter.name !== "Room");
        } else {
          const allCategories = categories;
          categoryIds = allCategories.map(category => category._id);
        }
   
      } else {
        const allCategories = categories;
        categoryIds = allCategories.map(category => category._id);
      }
    }else {
      const allCategories = categories;
      categoryIds = allCategories.map(category => category._id);
    }
 
    const { products, count } = await productsRepository.getProductsByFilters(
      categoryIds,
      filters,
      parseInt(page as string),
      parseInt(pageSize as string),
      filteredByCateory,
      query
    );
console.log("products",products.length)
console.log("count",count)
    res.status(200).json({ products, count });
  } catch (err: any) {
    console.error(err.message);
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const handleUpdateProduct = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { product } = req.body;
    // console.log("product",product)
    if (!id) {
      throw new HttpError(400, "Product id is required");
    }
    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );
    const faqRepository = new FaqRepository(
      req.connectionKey,
      faqSchema,
      "Faq"
    );
// console.log("product",product)
    const faqIds = await faqRepository.updateFaqs(product.faqs);
    await productsRepository.updateProduct(id, { ...product, faqs: faqIds });
    return res.status(200).json({ message: "Product updated successfuly" });
  } catch (error: any) {
    console.log(error.message);
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const handleNewProduct = async (req: any, res: Response) => {
  try {
    const { product } = req.body;
    if (!product) {
      throw new HttpError(400, "Product is required");
    }
    console.log("ppp", product)
    const productsRepository = new ProductsRepository(
      req.connectionKey,
      ProductSchema,
      "Product"
    );
    const faqRepository = new FaqRepository(
      req.connectionKey,
      faqSchema,
      "Faq"
    );
    const faqIds = await faqRepository.updateFaqs(product.faqs);
    const newProduct = await productsRepository.newProduct({
      ...product,
      faqs: faqIds,
    });
    return res.status(200).json({ product: newProduct });
  } catch (error: any) {
    console.log("sssssss", error.message);
    if (error.code === 11000) {
      // Duplicate key error
      return res
        .status(409)
        .json({ message: "A product with this sku/ean already exists." });
    } else {
      // Other errors
      return res.status(error.status || 500).json({ message: error.message });
    }
  }
};
