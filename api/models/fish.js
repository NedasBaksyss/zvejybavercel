import mongoose from "mongoose";

const fishSchema = new mongoose.Schema(
  {
    gamesId: {
      type: String,
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
      default: "common",
    },

    sprite: {
      type: String,
    }
  }
);

const Fish = mongoose.model("Fish", fishSchema);

export default Fish;
