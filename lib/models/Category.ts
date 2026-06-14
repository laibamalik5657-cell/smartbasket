import mongoose, { Schema, model, models } from "mongoose";

export interface ICategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  emoji: string;
  tint: string;
  slug: string;
  order: number;
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
    emoji: {
      type: String,
      required: [true, "Category emoji/icon path is required."],
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
