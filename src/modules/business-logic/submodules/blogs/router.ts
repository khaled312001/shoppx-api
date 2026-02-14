import { Router } from "express";
import {
  handleNewBlog,
  handleUpdateBlog,
  handleAutuSaveBlog,
  handleGetBlogBySlug,
  handleGetBlogs,
  handleGetDrafts,
  handleGetPublishedBlogs,
} from "./handler";
import { verifyUser } from "../../../../middleware/authentication.middleware";

export const blogsRouter = Router();

blogsRouter.get("/", verifyUser, handleGetBlogs);
blogsRouter.post("/", verifyUser, handleNewBlog);
blogsRouter.put("/:id", verifyUser, handleUpdateBlog);
blogsRouter.put("/autosave/:slug", verifyUser, handleAutuSaveBlog);
blogsRouter.get("/slug/:slug", handleGetBlogBySlug);
blogsRouter.get("/published", handleGetPublishedBlogs);
blogsRouter.get("/drafts", verifyUser, handleGetDrafts);
