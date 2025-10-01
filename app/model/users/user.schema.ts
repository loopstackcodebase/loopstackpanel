import mongoose, { Schema, Document } from "mongoose";

export type UserType = "owner" | "admin";

/* ---------------------- Interface ---------------------- */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  phoneNumber: string;
  password: string;
  status: "active" | "inactive";
  type: UserType;
}

/* ---------------------- User Schema ---------------------- */
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      required: true,
      default: "active",
    },
    type: {
      type: String,
      enum: ["owner", "admin"],
      required: true,
      default: "owner",
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
