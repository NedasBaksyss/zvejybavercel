import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    gamesId: {
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

    reward: {
      type: Array,
      default: [],
    },

    sprite: {
      type: String,
    }
  }
);

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;
