import mongoose, { Schema, model, models } from "mongoose";

export interface ICategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  image: string;
  tint: string;
  slug: string;
  order: number;
  count: string;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required."],
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Category image URL is required."],
      trim: true,
    },
    tint: {
      type: String,
      required: [true, "Category tint class is required."],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Category slug is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    count: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

export const Category =
  (models.Category as mongoose.Model<ICategory>) ||
  model<ICategory>("Category", CategorySchema);
