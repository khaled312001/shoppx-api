import { CategoryRepository } from "./Category/category.repository";
import { CategorySchema, ICategory } from "./Category/category.schema";

// Recursive function to populate children
export async function populateChildren(
  connectionKey: string,
  categories: ICategory[],
) {
  const populated: ICategory[] = [];

  const categoryRepository = new CategoryRepository(
    connectionKey,
    CategorySchema,
    "Category"
  );

  for (const cat of categories) {
    let children: ICategory[] = [];

    if (cat.childrenIds) {
      const childDocs = await categoryRepository.findCategoriesWithIds(
        cat.childrenIds
      );
      children = childDocs;
    }

    populated.push({ ...cat, children });
  }

  return populated;
}
