import { Schema } from "mongoose";
import { getModel, registerModel } from "../../../../../database";
import { Blog, BlogContent, blogContentSchema } from "./blog.schema";

export class BlogRepository {
  private connectionKey: string;
  private modelName: string;
  private schema: Schema;

  constructor(connectionKey: string, schema: Schema, modelName: string) {
    this.connectionKey = connectionKey;
    this.modelName = modelName || "Blog";
    this.schema = schema;
  }

  private async getModel() {
    return await getModel(this.connectionKey, this.modelName, this.schema);
  }
  private async getBlogContentModel() {
    return await getModel(
      this.connectionKey,
      "BlogContent",
      blogContentSchema as Schema<any>
    );
  }
  public async createBlog(blog: Partial<Blog>): Promise<Blog | null> {
    const BlogModel = await this.getModel();
    const BlogContentModel = await this.getBlogContentModel();

    // Check for existing auto-saved content and update or create new content
    const existingContent = await BlogContentModel.findOne({
      slug: blog.slug,
    }).lean<BlogContent>();

    if (!existingContent) {
      return null;
    }

    // Check for existing blog and update or create new blog
    const existingBlog = await BlogModel.findOneAndUpdate(
      { slug: blog.slug },
      { ...blog, html: existingContent._id },
      { new: true, upsert: true }
    ).lean<Blog>();

    if (!existingBlog) {
      return null;
    }

    // Update the BlogContent with the blog reference
    await BlogContentModel.updateOne(
      { _id: existingContent._id },
      { blog: existingBlog._id }
    );

    return existingBlog;
  }
  public async updateBlog(blog: Partial<Blog>) {
    const Blog = await this.getModel();
    return await Blog.findByIdAndUpdate(blog._id, blog, { new: true }).lean();
  }
  public async updateBlogContent(content: Partial<Blog>) {
    const BlogContnet = await this.getBlogContentModel();
    return await BlogContnet.findByIdAndUpdate(content._id, content, {
      new: true,
    }).lean();
  }

  public async autoSaveBlog(slug: string, content: string, user: any) {
    const BlogContent = await this.getBlogContentModel();
    return await BlogContent.findOneAndUpdate(
      { slug },
      {
        $set: { html: content },
        $addToSet: { editors: user },
      },
      { new: true, upsert: true }
    );
  }

  public async getBlogBySlug(slug: string) {
    const Blog = await this.getModel();
    const BlogContent = await this.getBlogContentModel();
    const blog = await Blog.findOne({ slug }).lean();
    const content = (await BlogContent.findOne({ slug }).lean()) as BlogContent;
    if (blog) {
      return { ...blog, html: content.html };
    } else return null;
  }

  public async getBlogContent(slug: string) {
    const BlogContent = await this.getBlogContentModel();
    return (await BlogContent.findOne({ slug }).lean()) as BlogContent;
  }

  public async getPublishedBlogs(page: number, pageSize: number, lang: string) {
    const Blog = await this.getModel();
    await this.getBlogContentModel();
    const filter: any = {
      isPublished: true,
      hidden: { $ne: true },
    };
  
    if (lang) {
      filter.lang = lang;
    }

    const blogsTotal = await Blog.countDocuments(filter);


    const blogs = await Blog.find(filter)
      .populate("html")
      .skip(page * pageSize)
      .limit(pageSize)
      .lean();
    return { blogs, blogsTotal };
  }
  public async getBlogs(page: number, pageSize: number) {
    const Blog = await this.getModel();
    await this.getBlogContentModel();
    const blogsTotal = await Blog.countDocuments();
    const blogs = await Blog.find()
      .populate("html")
      .skip(page * pageSize)
      .limit(pageSize)
      .lean();
    return { blogs, blogsTotal };
  }

  public async getDraftContent(page: number, pageSize: number) {
    const BlogContent = await this.getBlogContentModel();
    const draftsTotal = await BlogContent.countDocuments({
      $or: [{ blog: { $exists: false } }, { blog: null }],
    });

    const drafts = await BlogContent.find({
      $or: [{ blog: { $exists: false } }, { blog: null }],
    })
      .sort({ updatedAt: -1 })
      .skip(page * pageSize)
      .limit(pageSize)
      .populate({
        path: "editors",
        select: "name email image",
      })
      .lean();
    return { drafts, draftsTotal };
  }
}
