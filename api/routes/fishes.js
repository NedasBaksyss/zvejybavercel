import express from "express";
import fs from "fs";
const router = express.Router();

import { ObjectId } from "mongodb";
import { getDB } from "../db.js";

const uploadFile = async (req, field, folder, name) => {
  try {
    // jei įkeltas failas foto lauke
    if (req.files && req.files[field]) {
      // priskiriame failo duomenis į data objektą
      let file = req.files[field].data;
      let file_mime = req.files[field].mimeType;

      // išsaugome failą kataloge
      let file_name = name + '.' + file_mime.split('/')[1];
      await fs.promises.writeFile(`public/${folder}/${file_name}`, file);

      return file_name;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function updateFoto(id, foto) {
  try {
    const db = getDB();

    const result = await db.collection(collectionName).updateOne(
      { _id: id },
      {
        $set: {
          foto: foto,
        },
      }
    );

    return result.modifiedCount > 0 || result.matchedCount > 0;
  } catch (err) {
    console.log(err);
    return null;
  }
}

const collectionName = "fish";

function createIdFilter(id) {
  if (ObjectId.isValid(id)) {
    return {
      $or: [{ _id: id }, { _id: new ObjectId(id) }],
    };
  }

  return { _id: id };
}

function prepareFishData(body, creating = false) {
  const fish = {};

  if (creating && (!body.name || typeof body.name !== "string")) {
    throw new Error("Žuvies pavadinimas yra privalomas");
  }

  const textFields = ["gamesId", "name", "description", "rarity"];

  for (const field of textFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string" || body[field].trim() === "") {
        throw new Error(`Laukas ${field} turi būti tekstas`);
      }

      fish[field] = body[field].trim();
    }
  }

  return fish;
}

router.get("/", async function (req, res) {
  try {
    const db = getDB();
    const fishes = await db.collection(collectionName).find().toArray();

    res.status(200).json(fishes);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Nepavyko gauti žuvų",
    });
  }
});

router.get("/:id", async function (req, res) {
  try {
    const db = getDB();
    const filter = createIdFilter(req.params.id);

    const fish = await db.collection(collectionName).findOne(filter);

    if (!fish) {
      return res.status(404).json({
        error: "Žuvis nerasta",
      });
    }

    res.status(200).json(fish);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Nepavyko gauti žuvies",
    });
  }
});

router.post("/", async function (req, res) {
  try {
    const db = getDB();
    const fish = prepareFishData(req.body, true);

    // Leidžia pačiam nurodyti ID, pavyzdžiui, "carp".
    if (req.body._id !== undefined && req.body._id !== "") {
      fish._id = String(req.body._id);
    }

    if (!fish.rarity) {
      fish.rarity = "common";
    }

    const result = await db.collection(collectionName).insertOne(fish);

    res.status(201).json({
      ...fish,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        error: "Žuvis su tokiu ID jau egzistuoja",
      });
    }

    if (error.message) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Nepavyko sukurti žuvies",
    });
  }
});

router.put("/:id", async function (req, res) {
  try {
    const db = getDB();
    const filter = createIdFilter(req.params.id);
    const updatedData = prepareFishData(req.body);

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        error: "Nepateikta duomenų atnaujinimui",
      });
    }

    const result = await db.collection(collectionName).updateOne(filter, {
      $set: updatedData,
    });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: "Žuvis nerasta",
      });
    }

    const updatedFish = await db.collection(collectionName).findOne(filter);

    res.status(200).json(updatedFish);
  } catch (error) {
    console.error(error);

    if (error.message) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Nepavyko atnaujinti žuvies",
    });
  }
});

router.put("/:id/sprite", async function (req, res) {
  try {
    // Patikriname, ar nuotrauka pateikta
    if (!req.files || !req.files.sprite) {
      return res.status(400).json({
        message: "Nuotrauka nepateikta",
      });
    }

    const db = getDB();

    // Surandame žuvį pagal ID
    const filter = ObjectId.isValid(req.params.id)
      ? {
          $or: [
            { _id: req.params.id },
            { _id: new ObjectId(req.params.id) },
          ],
        }
      : {
          _id: req.params.id,
        };

    const fish = await db
      .collection(collectionName)
      .findOne(filter);

    if (!fish) {
      return res.status(404).json({
        message: "Žuvis nerasta",
      });
    }

    // Įkeliame failą
    const uploadedFoto = await uploadFile(
      req,
      "sprite",
      "images/fish",
      req.params.id
    );

    if (!uploadedFoto) {
      return res.status(500).json({
        message: "Klaida įkeliant nuotrauką",
      });
    }

    // Atnaujiname MongoDB
    const result = await db
      .collection(collectionName)
      .updateOne(filter, {
        $set: {
          sprite: uploadedFoto,
        },
      });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Žuvis nerasta",
      });
    }

    res.status(200).json({
      message: "Nuotrauka įkelta",
      sprite: uploadedFoto,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Klaida įkeliant nuotrauką",
    });
  }
});

router.delete("/:id", async function (req, res) {
  try {
    const db = getDB();
    const filter = createIdFilter(req.params.id);

    const result = await db.collection(collectionName).deleteOne(filter);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: "Žuvis nerasta",
      });
    }

    res.status(200).json({
      message: "Žuvis sėkmingai ištrinta",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Nepavyko ištrinti žuvies",
    });
  }
});

export default router;
