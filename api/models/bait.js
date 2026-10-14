const mongoose = require("mongoose");

const baitSchema = new mongoose.Schema(
  {
    baitId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    rarity: {
      type: String,
      enum: ["common", "uncommon", "rare", "epic", "legendary"],
      default: "common",
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    stackable: {
      type: Boolean,
      default: true,
    },

    maxStack: {
      type: Number,
      default: 99,
      min: 1,
    },

    baitType: {
      type: String,
      enum: ["natural", "artificial", "special"],
      default: "natural",
    },

    attraction: {
      type: Number,
      default: 1,
      min: 0,
    },

    preferredFish: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fish",
    }],

    effectiveness: {
      type: Number,
      default: 1,
      min: 0,
    },

    uses: {
      type: Number,
      default: 1,
      min: 1,
    },

    sprite: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bait", baitSchema);