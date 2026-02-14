import { Schema } from "mongoose";

export interface Blog {
  _id: string;
  title: string;
  description: string;
  cover: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  isPublished: boolean;
  publisher: string;
  hidden: boolean;
  tags: string[];
  html: any;
  wordCount: number;
  charCount: number;
  readingTime: number;
  slug: string;
  lang: string;
}

export interface BlogContent {
  _id: string;
  html: string;
  slug: string;
  blog: any;
  createdAt: Date;
  updatedAt: Date;
  hex: string;
  editors: {
    name: string;
    image: string;
  }[];
}

export const blogSchema = new Schema<Blog>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
      required: false,
    },
    publishedAt: {
      type: Date,
      required: false,
    },
    isPublished: {
      type: Boolean,
      required: true,
      default: false,
    },
    publisher: {
      type: String,
      required: false,
    },
    hidden: {
      type: Boolean,
      required: true,
      default: false,
    },
    tags: {
      type: [String],
      required: false,
      default: [],
    },
    html: {
      type: Schema.Types.ObjectId,
      ref: "BlogContent",
      required: false,
    },
    wordCount: {
      type: Number,
      required: true,
    },
    charCount: {
      type: Number,
      required: true,
    },
    readingTime: {
      type: Number,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    lang: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const blogContentSchema = new Schema<BlogContent>(
  {
    html: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: "BlogContent",
      required: false,
    },
    hex: {
      type: String,
      required: false,
    },
    editors: [{ type: Schema.Types.Mixed, required: false }],
  },
  { timestamps: true }
);
