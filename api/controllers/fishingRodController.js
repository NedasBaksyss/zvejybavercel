const fs = require("fs");
const path = require("path");
const FishingRod = require("../models/fishingRod");

// Upload sprite separately
const uploadFile = async (req, field, folder, name) => {
  try {
    if (req.files && req.files[field]) {
      const file = req.files[field].data;
      const fileMime = req.files[field].mimeType;

      const extension = fileMime.split("/")[1];
      const fileName = `${name}.${extension}`;

      const uploadPath = path.join(
        process.cwd(),
        "public",
        folder
      );

      await fs.promises.mkdir(uploadPath, {
        recursive: true,
      });

      await fs.promises.writeFile(
        path.join(uploadPath, fileName),
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

// GET /api/fishing-rods
exports.getFishingRods = async (req, res) => {
  try {
    const fishingRods = await FishingRod.find();

    res.status(200).json(fishingRods);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Klaida gaunant meškeres",
    });
  }
};

// GET /api/fishing-rods/:id
exports.getFishingRodById = async (req, res) => {
  try {
    const fishingRod = await FishingRod.findById(req.params.id);

    if (!fishingRod) {
      return res.status(404).json({
        message: "Meškerė nerasta",
      });
    }

    res.status(200).json(fishingRod);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Klaida gaunant meškerę",
    });
  }
};

// POST /api/fishing-rods
exports.createFishingRod = async (req, res) => {
  try {
    const fishingRod = new FishingRod(req.body);
    const savedFishingRod = await fishingRod.save();

    res.status(201).json({
      message: "Meškerė sukurta",
      fishingRod: savedFishingRod,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Meškerė tokiu pavadinimu jau egzistuoja",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Neteisingi meškerės duomenys",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Klaida kuriant meškerę",
    });
  }
};

// PUT /api/fishing-rods/:id
exports.updateFishingRod = async (req, res) => {
  try {
    const fishingRod = await FishingRod.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!fishingRod) {
      return res.status(404).json({
        message: "Meškerė nerasta",
      });
    }

    res.status(200).json({
      message: "Meškerė atnaujinta",
      fishingRod,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Meškerė tokiu pavadinimu jau egzistuoja",
      });
    }

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "Neteisingi meškerės duomenys",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Klaida atnaujinant meškerę",
    });
  }
};

// DELETE /api/fishing-rods/:id
exports.deleteFishingRod = async (req, res) => {
  try {
    const fishingRod = await FishingRod.findByIdAndDelete(
      req.params.id
    );

    if (!fishingRod) {
      return res.status(404).json({
        message: "Meškerė nerasta",
      });
    }

    res.status(200).json({
      message: "Meškerė ištrinta",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Klaida trinant meškerę",
    });
  }
};

// PUT /api/fishing-rods/:id/sprite
exports.updateFishingRodSprite = async (req, res) => {
  try {
    if (!req.files || !req.files.sprite) {
      return res.status(400).json({
        message: "Nuotrauka nepateikta",
      });
    }

    const fishingRod = await FishingRod.findById(req.params.id);

    if (!fishingRod) {
      return res.status(404).json({
        message: "Meškerė nerasta",
      });
    }

    const uploadedSprite = await uploadFile(
      req,
      "sprite",
      "images/fishingRods",
      req.params.id
    );

    if (!uploadedSprite) {
      return res.status(500).json({
        message: "Klaida įkeliant nuotrauką",
      });
    }

    fishingRod.sprite = uploadedSprite;

    await fishingRod.save();

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