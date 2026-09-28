import fs from "fs";
import FishingSpot from "../models/fishingSpots.js";

const uploadFile = async (req, field, folder, name) => {
  try {
    if (!req.files || !req.files[field]) {
      return null;
    }

    const file = req.files[field].data;
    const fileMime = req.files[field].mimeType;

    const extension = fileMime.split("/")[1];
    const fileName = `${name}.${extension}`;

    await fs.promises.writeFile(
      `public/${folder}/${fileName}`,
      file
    );

    return fileName;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getFishingSpots = async (req, res) => {
  try {
    const fishingSpots = await FishingSpot.find();

    res.status(200).json(fishingSpots);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to obtain fishing spots.",
    });
  }
};

export const getFishingSpot = async (req, res) => {
  try {
    const fishingSpot = await FishingSpot.findById(req.params.id);

    if (!fishingSpot) {
      return res.status(404).json({
        error: "Fishing spot not found.",
      });
    }

    res.status(200).json(fishingSpot);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: "Invalid fishing spot ID.",
    });
  }
};

export const createFishingSpot = async (req, res) => {
  try {
    const fishingSpot = await FishingSpot.create({
      mapId: req.body.mapId,
      name: req.body.name,
      description: req.body.description,
      world: req.body.world,
      possibleFishes: req.body.possibleFishes,
    });

    res.status(201).json(fishingSpot);
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to create the fishing spot.",
    });
  }
};

export const updateFishingSpot = async (req, res) => {
  try {
    const updatedData = {
      mapId: req.body.mapId,
      name: req.body.name,
      description: req.body.description,
      world: req.body.world,
      possibleFishes: req.body.possibleFishes,
    };

    const fishingSpot = await FishingSpot.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!fishingSpot) {
      return res.status(404).json({
        error: "Fishing spot not found.",
      });
    }

    res.status(200).json(fishingSpot);
  } catch (error) {
    console.error("UPDATE FISHING SPOT ERROR:", error);

    res.status(400).json({
      error: error.message,
    });
  }
};


export const updateFishingSpotSprite = async (req, res) => {
  try {
    if (!req.files || !req.files.sprite) {
      return res.status(400).json({
        message: "No sprite provided.",
      });
    }

    const fishingSpot = await FishingSpot.findById(
      req.params.id
    );

    if (!fishingSpot) {
      return res.status(404).json({
        message: "Fishing spot not found.",
      });
    }

    const uploadedSprite = await uploadFile(
      req,
      "sprite",
      "images/fishing-spot",
      req.params.id
    );

    if (!uploadedSprite) {
      return res.status(500).json({
        message: "Error uploading sprite.",
      });
    }

    fishingSpot.sprite = uploadedSprite;

    await fishingSpot.save();

    res.status(200).json({
      message: "Sprite uploaded.",
      sprite: uploadedSprite,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error uploading sprite.",
    });
  }
};

export const deleteFishingSpot = async (req, res) => {
  try {
    const fishingSpot =
      await FishingSpot.findByIdAndDelete(req.params.id);

    if (!fishingSpot) {
      return res.status(404).json({
        error: "Fishing spot not found.",
      });
    }

    res.status(200).json({
      message: "The fishing spot has been successfully deleted.",
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: "Invalid fishing spot ID.",
    });
  }
};
