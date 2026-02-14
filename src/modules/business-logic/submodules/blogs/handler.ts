import { Response } from "express";
import { BlogRepository } from "./Blog/blog.repository";
import { blogSchema } from "./Blog/blog.schema";

export const handleNewBlog = async (req: any, res: Response) => {
  try {
    const { blog } = req.body;
    console.log("jjjjjj", req.body)
    const blogRepository = new BlogRepository(
      req.connectionKey,
      blogSchema,
      "Blog"
    );
    const newBlog = await blogRepository.createBlog(blog);
    res.status(201).json({ message: "Blog created", blog: newBlog });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
export const handleUpdateBlog = async (req: any, res: Response) => {
  try {
    const { type } = req.query;
    const { blog } = req.body;

    const blogRepository = new BlogRepository(
      req.connectionKey,
      blogSchema,
      "Blog"
    );
    if (type === "blog") {
      const updatedBlog = await blogRepository.updateBlog(blog);
      res.status(200).json({ message: "Blog updated", blog: updatedBlog });
      return;
    } else if (type === "draft") {
      const updatedBlog = await blogRepository.updateBlogContent(blog);
      res.status(200).json({ message: "Blog updated", blog: updatedBlog });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const handleAutuSaveBlog = async (req: any, res: Response) => {
  try {
    const { slug } = req.params;
    const { contentHTML } = req.body;

    const blogRepository = new BlogRepository(
      req.connectionKey,
      blogSchema,
      "Blog"
    );
    const result = await blogRepository.autoSaveBlog(slug, contentHTML, {
      name: req.user.name,
      image: req.user.image,
    });
    if (result.modifiedCount === 0) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }
    res.status(200).json({ message: "Blog updated", result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const handleGetBlogBySlug = async (req: any, res: Response) => {
  try {
    const { slug } = req.params;
    const blogRepository = new BlogRepository(
      req.connectionKey,
      blogSchema,
      "Blog"
    );

    // Try to get the blog with populated content
    let blog = await blogRepository.getBlogBySlug(slug);

    if (blog) {
      // If blog exists, return it
      res.status(200).json({ blog });
      return;
    } else {
      // If blog doesn't exist, try to get content from auto-save collection
      const content = await blogRepository.getBlogContent(slug);

      if (content) {
        // If auto-saved content exists, return it
        res.status(200).json({
          message: "Only found auto-saved content",
          blog: { slug, html: content.html },
        });
      } else {
        // If no content found at all
        res.status(404).json({ message: "Blog not found" });
      }
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const handleGetBlogs = async (req: any, res: Response) => {
  try {
    const { page, pageSize } = req.query;
    const blogRepository = new BlogRepository(
      req.connectionKey,
      blogSchema,
      "Blog"
    );
    const { blogs, blogsTotal } = await blogRepository.getBlogs(page, pageSize);
    res.status(200).json({ blogs, blogsTotal });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const handleGetPublishedBlogs = async (req: any, res: Response) => {
  try {
    const { page, pageSize ,lang} = req.query;
    console.log("kkk",lang)
    const blogRepository = new BlogRepository(
      req.connectionKey,
      blogSchema,
      "Blog"
    );
    const { blogs, blogsTotal } = await blogRepository.getPublishedBlogs(page, pageSize, lang);
    res.status(200).json({ blogs, blogsTotal });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const handleGetDrafts = async (req: any, res: Response) => {
  try {
    const { page, pageSize } = req.query;
    const blogRepository = new BlogRepository(
      req.connectionKey,
      blogSchema,
      "Blog"
    );
    const { drafts, draftsTotal } = await blogRepository.getDraftContent(
      page,
      pageSize
    );
    res.status(200).json({ drafts, draftsTotal });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
