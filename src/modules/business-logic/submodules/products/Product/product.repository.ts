import { Connection, Model, Schema } from "mongoose";
import { getModel, getTenantConnection } from "../../../../../database";
import { IProduct } from "./product.schema";
import { faqSchema, IFaq } from "../../faqs/FAQ/faq.schema";
import { Types } from "mongoose";

export class ProductsRepository {
  private connectionKey: string;
  private modelName: string;
  private schema: Schema;

  constructor(connectionKey: string, schema: Schema, modelName: string) {
    this.connectionKey = connectionKey;
    this.modelName = modelName || "Product";
    this.schema = schema;
  }

  private async getModel() {
    const connection = await getTenantConnection(this.connectionKey);
    if (!connection.models["Faq"]) {
      connection.model("Faq", faqSchema);
    }
    return await getModel(this.connectionKey, this.modelName, this.schema);
  }

  // Repository GET methods

  public async findPaginatedProducts(
    page: number,
    pageSize: number,
    search: string
  ): Promise<{ products: IProduct[]; count: number }> {
    const Product = await this.getModel();
    const query: any = {};
    if (search && search != "") {
      const escapedSearchTerm = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearchTerm, 'i'); // 'i' for case-insensitive

     const searchQuery = [
      {
        $or: [
          { name: { $regex: regex } },
          { sku: search },
          {
            otherSpecifications: {
              $elemMatch: {
                $or: [
                  { value: { $regex: search, $options: "i" } }, // Case-insensitive regex match
                  { value: { $in: [new RegExp(search, "i")] } } // Case-insensitive match in array
                ]
              }
            }
          }
        ]
      }
    ]

      query.$and = query.$and ? [...query.$and, { $and: searchQuery }] : [{ $and: searchQuery }];

    }

    const products = await Product.find(query)
      .skip(page * pageSize)
      .limit(pageSize)
      .lean();

    const count = await Product.countDocuments();

    return { products, count } as { products: IProduct[]; count: number };
  }

  public async findCategoryProducts(
    category_ids: string[],
    limiter: number = 50
  ): Promise<IProduct[]> {
    const Product = await this.getModel();

    const products = (await Product.find({
      categoryIds: { $in: category_ids },
    })
      .lean()
      .limit(limiter)) as IProduct[];
    return products;
  }

  public async findPopularProducts(limit: number): Promise<IProduct[]> {
    const Product = await this.getModel();
    return (await Product.find({
      popular: true,
    })
      .limit(limit)
      .lean()) as IProduct[];
  }

  public async findProductById(id: string): Promise<IProduct> {
    const Product = await this.getModel();
    return (await Product.findById(id).populate("faqs").lean()) as IProduct;
  }

  public async findProductsByIds(ids: string[]): Promise<IProduct[]> {
    const Product = await this.getModel();
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    return (await Product.find({
      _id: { $in: objectIds },
    }).lean()) as IProduct[];
  }
  public async findProductByName(name: string): Promise<IProduct> {
    const Product = await this.getModel();
    return (await Product.findOne({
      name,
    }).lean()) as IProduct;
  }

  public async findProductBySlug(slug: string): Promise<IProduct> {
    const Product = await this.getModel();
    return (await Product.findOne({
      slug,
    }).lean()) as IProduct;
  }

  public async findProductBySku(sku: string): Promise<IProduct> {
    const Product = await this.getModel();
    return (await Product.findOne({
      sku,
    }).lean()) as IProduct;
  }

  public async findProductBySearch(query: string): Promise<IProduct> {

    const Product = await this.getModel();
    // if(page && pageSize){
    const escapedSearchTerm = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSearchTerm, 'i'); // 'i' for case-insensitive
    return (await Product.find({
      $or: [
        { name: { $regex: regex } },
        { sku: query },
        {
          otherSpecifications: {
            $elemMatch: {
              $or: [
                { value: { $regex: query, $options: "i" } }, // Case-insensitive regex match
                { value: { $in: [new RegExp(query, "i")] } } // Case-insensitive match in array
              ]
            }
          }
        }
      ]
    }).lean()) as IProduct;



    // }
    // return (await Product.find({
    //   $text: { $search: query },
    // }).lean()) as IProduct;
  }

  public async getProductsByFilters(
    category_ids?: string[],
    filters?: { name: string; value: string[] }[],
    page?: number,
    pageSize?: number,
    filteredByCateory?: boolean,
    search?: string
  ) {
    const Product = await this.getModel();
    const query: any = {};

    // Add category filter if provided
    if (category_ids && category_ids.length > 0) {
      query.categoryIds = filteredByCateory ? { $all: category_ids } : { $in: category_ids };
    }

    // Add filters if provided
    if (filters && filters.length > 0) {
      const priceRangeFilter = filters?.find(filter => filter.name === 'priceRange');
      if (priceRangeFilter) {
        const priceRange = priceRangeFilter.value; // Assuming priceRange is in the format [[minPrice, maxPrice]]
        if (priceRange && priceRange.length > 0) {
          const [minPrice, maxPrice] = priceRange[0];
          query.$and = [
            {
              $or: [
                { price: { $gte: minPrice, $lte: maxPrice } },
                { discount: { $gte: minPrice, $lte: maxPrice } }
              ]
            }
          ];

        }
      }

      filters = filters.filter((filter: { name: string; }) => filter.name !== "priceRange");

      if (filters && filters.length > 0) {
        // query.$or = filters.map((filter) => ({
        //   otherSpecifications: {
        //     $elemMatch: {
        //       name: filter.name,
        //       $or: [{ value: filter.value }, { value: { $in: filter.value } }],
        //     },
        //   },
        // }));

        const otherFiltersQuery = filters.map(filter => ({
          otherSpecifications: {
            $elemMatch: {
              name: filter.name,
              $or: [{ value: filter.value }, { value: { $in: filter.value } }],
            }
          }
        }));

        // Add other filters to the `$and` condition to combine with `priceRange`
        query.$and = query.$and ? [...query.$and, { $and: otherFiltersQuery }] : [{ $and: otherFiltersQuery }];
      }


    }

    if (search && search != "") {
      const escapedSearchTerm = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearchTerm, 'i'); // 'i' for case-insensitive

     const searchQuery = [
      {
        $or: [
          { name: { $regex: regex } },
          { sku: search },
          {
            otherSpecifications: {
              $elemMatch: {
                $or: [
                  { value: { $regex: search, $options: "i" } }, // Case-insensitive regex match
                  { value: { $in: [new RegExp(search, "i")] } } // Case-insensitive match in array
                ]
              }
            }
          }
        ]
      }
    ]

      query.$and = query.$and ? [...query.$and, { $and: searchQuery }] : [{ $and: searchQuery }];

    }
    console.log("query", JSON.stringify(query))
    const products = await Product.find(query)
      .skip(page && pageSize ? page * pageSize : 0)
      .limit(pageSize ?? 100)
      .lean();

    const count = await Product.countDocuments(query);
    return { products, count };
  }
  // Repository POST methods
  public async bulckInsertProducts(data: IProduct[]): Promise<IProduct[]> {
    const Product = await this.getModel();
    return Product.insertMany(data);
  }

  public async bulkUpdateProducts(): Promise<any> {
    const Product = await this.getModel();
    await Product.updateMany(
      { popular: { $exists: false } }, // Find documents that do not have the 'popular' field
      { $set: { popular: "" } } // Set a default value for the 'popular' field
    );
  }

  public async newProduct(data: IProduct): Promise<IProduct> {
    const Product = await this.getModel();
    return new Product(data).save();
  }

  // Repository PUT methods
  async updateProduct(
    productId: string | Schema.Types.ObjectId,
    updateData: Partial<IProduct>
  ) {
    const Product = await this.getModel();
    await Product.updateOne({ _id: productId }, updateData);
  }
}
