import mongoose from "mongoose";

const statsSchema = new mongoose.Schema(
  {
    totalFishCaught: {
      type: Number,
      default: 0,
      min: 0,
    },

    coins: {
      type: Number,
      default: 0,
      min: 0,
    },

    level: {
      type: Number,
      default: 0,
      min: 0,
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    role: {
      type: String,
      enum: ["guest", "user", "admin"],
      default: "user",
    },

    passwordHash: {
      type: String,
      default: null,
    },

    googleId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },

    stats: {
      type: statsSchema,
      default: () => ({}),
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
