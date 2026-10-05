import mongoose from "mongoose";

const possibleFishSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fish",
      required: true,
    },

    minWeight: {
      type: Number,
      required: true,
    },

    maxWeight: {
      type: Number,
      required: true,
    },

    baseValue: {
      type: Number,
      required: true,
    },

    coinValue: {
      type: Number,
      required: true,
    },

    experienceReward: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const fishingSpotSchema = new mongoose.Schema(
  {
    mapId: {
      type: String,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    world: {
      type: String,
    },

    position: {
      type: Object,
      default: {}
    },

    possibleFishes: {
      type: [possibleFishSchema],
      default: [],
    },

    sprite: {
      type: String,
    },
  }
);

const FishingSpot = mongoose.model(
  "FishingSpot",
  fishingSpotSchema
);

export default FishingSpot;
