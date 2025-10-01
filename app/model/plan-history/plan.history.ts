import mongoose, { Schema, Document } from "mongoose";

/* ---------------------- Interface ---------------------- */
export interface IPlanHistory extends Document {
  _id: mongoose.Types.ObjectId;
  buyed_owner_username: string;
  plan_id: mongoose.Types.ObjectId;
  buyed_date: Date;
  expiry_date: Date;
  status: "active" | "expired" | "cancelled";
}

/* ---------------------- Plan History Schema ---------------------- */
const PlanHistorySchema = new Schema<IPlanHistory>(
  {
    buyed_owner_username: {
      type: String,
      required: true,
      trim: true,
    },
    plan_id: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    buyed_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      required: true,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
PlanHistorySchema.index({ buyed_owner_username: 1 });
PlanHistorySchema.index({ plan_id: 1 });
PlanHistorySchema.index({ buyed_date: -1 });
PlanHistorySchema.index({ expiry_date: 1 });

export const PlanHistoryModel =
  mongoose.models.PlanHistory || mongoose.model<IPlanHistory>("PlanHistory", PlanHistorySchema);