import mongoose, { Schema, Document } from "mongoose";

/* ---------------------- Interface ---------------------- */
export interface IPlan extends Document {
  _id: mongoose.Types.ObjectId;
  plan_name: string;
  plan_validity_days: number;
  plan_price: number;
  status: "active" | "inactive";
}

/* ---------------------- Plan Schema ---------------------- */
const PlanSchema = new Schema<IPlan>(
  {
    plan_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    plan_validity_days: {
      type: Number,
      required: true,
      min: 1,
    },
    plan_price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      required: true,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const PlanModel =
  mongoose.models.Plan || mongoose.model<IPlan>("Plan", PlanSchema);