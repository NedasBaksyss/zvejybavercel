import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    achievementId: {
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

    requirement: [
      {
        type: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
        },
        value: {
          type: String,
        },
      },
    ],

    reward: [
      {
        type: {
          type: String,
          required: true,
        },
        amount: Number,
        value: String,
      },
    ],

    sprite: {
      type: String,
    },
  }
);

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;
