const fs = require("fs");
const path = require("path");
const Item = require("../models/item");

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

// GET /api/items
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find();

    res.status(200).json(items);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Klaida gaunant daiktus",
    });
  }
};

// GET /api/items/:id
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Daiktas nerastas",
      });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Klaida gaunant daiktą",
    });
  }
};

// POST /api/items
exports.createItem = async (req, res) => {
  try {
    const item = new Item(req.body);
    const savedItem = await item.save();

    res.status(201).json({
      message: "Daiktas sukurtas",
      item: savedItem,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Daiktas tokiu pavadinimu jau egzistuoja",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Neteisingi daikto duomenys",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Klaida kuriant daiktą",
    });
  }
};

// PUT /api/items/:id
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        message: "Daiktas nerastas",
      });
    }

    res.status(200).json({
      message: "Daiktas atnaujintas",
      item,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Daiktas tokiu pavadinimu jau egzistuoja",
      });
    }

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "Neteisingi daikto duomenys",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Klaida atnaujinant daiktą",
    });
  }
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Daiktas nerastas",
      });
    }

    res.status(200).json({
      message: "Daiktas ištrintas",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Klaida trinant daiktą",
    });
  }
};

// PUT /api/items/:id/sprite
exports.updateItemSprite = async (req, res) => {
  try {
    if (!req.files || !req.files.sprite) {
      return res.status(400).json({
        message: "Nuotrauka nepateikta",
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Daiktas nerastas",
      });
    }

    const uploadedSprite = await uploadFile(
      req,
      "sprite",
      "images/items",
      req.params.id
    );

    if (!uploadedSprite) {
      return res.status(500).json({
        message: "Klaida įkeliant nuotrauką",
      });
    }

    item.sprite = uploadedSprite;

    await item.save();

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