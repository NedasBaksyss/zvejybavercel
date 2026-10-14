const fs = require("fs");
const path = require("path");
const Bait = require("../models/bait");

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

// GET /api/baits
exports.getBaits = async (req, res) => {
  try {
    const baits = await Bait.find().populate("preferredFish");

    res.status(200).json(baits);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Klaida gaunant masalus",
    });
  }
};

// GET /api/baits/:id
exports.getBaitById = async (req, res) => {
  try {
    const bait = await Bait.findById(req.params.id)
      .populate("preferredFish");

    if (!bait) {
      return res.status(404).json({
        message: "Masalas nerastas",
      });
    }

    res.status(200).json(bait);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Klaida gaunant masalą",
    });
  }
};

// POST /api/baits
exports.createBait = async (req, res) => {
  try {
    const bait = new Bait(req.body);

    const savedBait = await bait.save();

    res.status(201).json({
      message: "Masalas sukurtas",
      bait: savedBait,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Masalas tokiu pavadinimu jau egzistuoja",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Neteisingi masalo duomenys",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Klaida kuriant masalą",
    });
  }
};

// PUT /api/baits/:id
exports.updateBait = async (req, res) => {
  try {
    const bait = await Bait.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("preferredFish");

    if (!bait) {
      return res.status(404).json({
        message: "Masalas nerastas",
      });
    }

    res.status(200).json({
      message: "Masalas atnaujintas",
      bait,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Masalas tokiu pavadinimu jau egzistuoja",
      });
    }

    if (error.name === "ValidationError" ||
        error.name === "CastError") {
      return res.status(400).json({
        message: "Neteisingi masalo duomenys",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Klaida atnaujinant masalą",
    });
  }
};

// DELETE /api/baits/:id
exports.deleteBait = async (req, res) => {
  try {
    const bait = await Bait.findByIdAndDelete(req.params.id);

    if (!bait) {
      return res.status(404).json({
        message: "Masalas nerastas",
      });
    }

    res.status(200).json({
      message: "Masalas ištrintas",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Klaida trinant masalą",
    });
  }
};

// PUT /api/baits/:id/sprite
exports.updateBaitSprite = async (req, res) => {
  try {
    if (!req.files || !req.files.sprite) {
      return res.status(400).json({
        message: "Nuotrauka nepateikta",
      });
    }

    const bait = await Bait.findById(req.params.id);

    if (!bait) {
      return res.status(404).json({
        message: "Masalas nerastas",
      });
    }

    const uploadedSprite = await uploadFile(
      req,
      "sprite",
      "images/bait",
      req.params.id
    );

    if (!uploadedSprite) {
      return res.status(500).json({
        message: "Klaida įkeliant nuotrauką",
      });
    }

    bait.sprite = uploadedSprite;

    await bait.save();

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