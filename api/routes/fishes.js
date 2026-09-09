var express = require("express");
var router = express.Router();

const { ObjectId } = require("mongodb");
const { getDB } = require("../db");

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

  const textFields = ["name", "rarity"];

  for (const field of textFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string" || body[field].trim() === "") {
        throw new Error(`Laukas ${field} turi būti tekstas`);
      }

      fish[field] = body[field].trim();
    }
  }

  const numberFields = [
    "minWeight",
    "maxWeight",
    "baseValue",
    "experienceReward",
    "coin_value",
  ];

  for (const field of numberFields) {
    if (body[field] !== undefined) {
      const number = Number(body[field]);

      if (!Number.isFinite(number) || number < 0) {
        throw new Error(`Laukas ${field} turi būti teigiamas skaičius`);
      }

      fish[field] = number;
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

module.exports = router;
