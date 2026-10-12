import mongoose from "mongoose";

const fishSchema = new mongoose.Schema(
  {
    fishId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    rarity: {
      type: String,
      enum: ["common", "uncommon", "rare", "epic", "legendary"],
      default: "common",
    },

    sprite: {
      type: String,
    }
  }
);

const Fish = mongoose.model("Fish", fishSchema);

export default Fish;
