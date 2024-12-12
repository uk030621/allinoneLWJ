import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    data: {
      type: Object, // User-specific structured data
      default: {},
    },
    age: {
      type: Number, // Numeric field
      default: 0,
    },
    isActive: {
      type: Boolean, // Boolean field
      default: false,
    },
    bio: {
      type: String, // Text field
      default: "",
    },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
