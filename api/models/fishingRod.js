const mongoose = require("mongoose");

const fishingRodSchema = new mongoose.Schema(
  {
    fishingRodId: {
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

    rodType: {
      type: String,
      enum: ["basic", "spinning", "casting", "fly", "professional", "special"],
      default: "basic",
    },

    stats: {
      fishingPower: {
        type: Number,
        default: 1,
        min: 0,
      },

      luck: {
        type: Number,
        default: 0,
        min: 0,
      },

      lineStrength: {
        type: Number,
        default: 10,
        min: 0,
      },

      reelSpeed: {
        type: Number,
        default: 1,
        min: 0,
      },
    },

    levelRequirement: {
      type: Number,
      default: 1,
      min: 1,
    },

    allowedBaitTypes: [{
      type: String,
      enum: ["natural", "artificial", "special"],
    }],

    sprite: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FishingRod", fishingRodSchema);