// models/useractivity.js
import mongoose, { models, Schema } from "mongoose";

const userActivitySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const UserActivity =
  models.UserActivity || mongoose.model("UserActivity", userActivitySchema);
export default UserActivity;