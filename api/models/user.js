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
      default: 1,
      min: 1,
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    gamesPlayed: {
      type: Number,
      default: 0,
      min: 0,
    },

    gamesWon: {
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
      required() { return this.role !== "guest"; },
      unique: true,
      sparse: true,
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
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    guestTokenHash: { type: String, unique: true, sparse: true, select: false },
    catchReceipts: { type: [String], default: undefined, select: false },

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
