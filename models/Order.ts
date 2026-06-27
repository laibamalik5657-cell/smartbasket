import mongoose, { Schema, model, models } from "mongoose";

export interface IOrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  unit?: string;
  category?: string;
  quantity: number;
}

export interface IOrderCustomer {
  name: string;
  phone: string;
  city: string;
  area: string;
  address: string;
}

export interface IOrder {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: string;
  status: "pending" | "assigned" | "delivered" | "cancelled";
  riderId?: mongoose.Types.ObjectId;
  customer: IOrderCustomer;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    unit: { type: String, default: "" },
    category: { type: String, default: "" },
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const OrderCustomerSchema = new Schema<IOrderCustomer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    payment: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "assigned", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    customer: { type: OrderCustomerSchema, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Order =
  (models.Order as mongoose.Model<IOrder>) ||
  model<IOrder>("Order", OrderSchema);

/** Shape returned to the client (matches the `Order` type in lib/store). */
export interface PlainOrder {
  id: string;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: string;
  status: "pending" | "assigned" | "delivered" | "cancelled";
  riderId: string | null;
  customer: IOrderCustomer;
  createdAt: string;
}

/** Map a DB order document to the plain JSON shape the client expects. */
export function toPlainOrder(o: IOrder): PlainOrder {
  return {
    id: o._id.toString(),
    items: o.items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      image: i.image,
      unit: i.unit ?? "",
      category: i.category ?? "",
      quantity: i.quantity,
    })),
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    payment: o.payment,
    status: o.status ?? "pending",
    riderId: o.riderId ? o.riderId.toString() : null,
    customer: o.customer,
    createdAt:
      o.createdAt instanceof Date
        ? o.createdAt.toISOString()
        : new Date(o.createdAt).toISOString(),
  };
}
