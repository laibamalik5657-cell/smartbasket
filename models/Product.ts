import mongoose, { Schema, model, models } from "mongoose";

export interface IProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  unit?: string;
  image: string;
  category?: string;
  description: string;
  tag?: string;
  oldPrice?: number;
  discount?: string;
  rating?: number;
  inStock: boolean;
  order: number;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: [true, "Product name is required."], trim: true },
    slug: {
      type: String,
      required: [true, "Product slug is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    price: { type: Number, required: [true, "Product price is required."] },
    unit: { type: String, default: "", trim: true },
    image: { type: String, required: [true, "Product image is required."], trim: true },
    category: { type: String, default: "", trim: true },
    description: {
      type: String,
      required: [true, "Product description is required."],
      trim: true,
    },
    tag: { type: String, default: "", trim: true },
    oldPrice: { type: Number },
    discount: { type: String, default: "", trim: true },
    rating: { type: Number },
    inStock: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Product =
  (models.Product as mongoose.Model<IProduct>) ||
  model<IProduct>("Product", ProductSchema);
