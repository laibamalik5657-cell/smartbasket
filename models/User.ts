import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin" | "rider";
  // Password reset: a sha256 hash of the emailed token (never the raw token) + its expiry.
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required."],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required."],
    },
    role: {
      type: String,
      enum: ["user", "admin", "rider"],
      default: "user",
      index: true,
    },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

export const User =
  (models.User as mongoose.Model<IUser>) || model<IUser>("User", UserSchema);
