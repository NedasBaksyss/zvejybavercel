import fs from "fs";
import Fish from "../models/fish.js";
import FishingSpot from "../models/fishingSpots.js";

const uploadFile = async (req, field, folder, name) => {
  try {
    if (req.files && req.files[field]) {
      const file = req.files[field].data;
      const fileMime = req.files[field].mimeType;

      const extension = fileMime.split("/")[1];
      const fileName = `${name}.${extension}`;

      await fs.promises.writeFile(
        `public/${folder}/${fileName}`,
        file
      );

      return fileName;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// GET /api/fish
export const getFishes = async (req, res) => {
  try {
    const fishes = await Fish.find();

    res.status(200).json(fishes);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Nepavyko gauti žuvų",
    });
  }
};

// GET /api/fish/:id
export const getFish = async (req, res) => {
  try {
    const fish = await Fish.findById(req.params.id);

    if (!fish) {
      return res.status(404).json({
        error: "Žuvis nerasta",
      });
    }

    res.status(200).json(fish);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: "Neteisingas žuvies ID",
    });
  }
};

// POST /api/fish
export const createFish = async (req, res) => {
  try {
    const fish = await Fish.create({
      gamesId: req.body.gamesId,
      name: req.body.name,
      description: req.body.description,
      rarity: req.body.rarity || "common",
    });

    res.status(201).json(fish);
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Nepavyko sukurti žuvies",
    });
  }
};

// PUT /api/fish/:id
export const updateFish = async (req, res) => {
  try {
    const fish = await Fish.findByIdAndUpdate(
      req.params.id,
      {
        gamesId: req.body.gamesId,
        name: req.body.name,
        description: req.body.description,
        rarity: req.body.rarity,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!fish) {
      return res.status(404).json({
        error: "Žuvis nerasta",
      });
    }

    res.status(200).json(fish);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
};

// PUT /api/fish/:id/sprite
export const updateFishSprite = async (req, res) => {
  try {
    if (!req.files || !req.files.sprite) {
      return res.status(400).json({
        message: "Nuotrauka nepateikta",
      });
    }

    const fish = await Fish.findById(req.params.id);

    if (!fish) {
      return res.status(404).json({
        message: "Žuvis nerasta",
      });
    }

    const uploadedSprite = await uploadFile(
      req,
      "sprite",
      "images/fish",
      req.params.id
    );

    if (!uploadedSprite) {
      return res.status(500).json({
        message: "Klaida įkeliant nuotrauką",
      });
    }

    fish.sprite = uploadedSprite;

    await fish.save();

    res.status(200).json({
      message: "Nuotrauka įkelta",
      sprite: uploadedSprite,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Klaida įkeliant nuotrauką",
    });
  }
};

// DELETE /api/fish/:id
export const deleteFish = async (req, res) => {
  try {
    const fish = await Fish.findByIdAndDelete(req.params.id);

    if (!fish) {
      return res.status(404).json({
        error: "Žuvis nerasta",
      });
    }

    // Remove this fish from all fishing spots
    await FishingSpot.updateMany(
      { "possibleFishes._id": fish._id },
      {
        $pull: {
          possibleFishes: {
            _id: fish._id,
          },
        },
      }
    );

    res.status(200).json({
      message: "Žuvis sėkmingai ištrinta",
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: "Neteisingas žuvies ID",
    });
  }
};
