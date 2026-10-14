const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    itemId: {
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

    category: {
      type: String,
      required: true,
      enum: [
        "hook",
        "fishing_line",
        "lure",
        "tool",
        "consumable",
        "material",
        "treasure",
        "quest",
        "misc",
      ],
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

    weight: {
      type: Number,
      default: 0,
      min: 0,
    },

    levelRequirement: {
      type: Number,
      default: 1,
      min: 1,
    },

    effects: {
      fishingPower: {
        type: Number,
        default: 0,
      },

      luck: {
        type: Number,
        default: 0,
      },
    },

    usable: {
      type: Boolean,
      default: false,
    },

    sellable: {
      type: Boolean,
      default: true,
    },

    sprite: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);