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

async function findAll() {
  const db = getDB();
  return db.collection(collectionName).find().toArray();
}

async function findById(id) {
  const db = getDB();
  return db.collection(collectionName).findOne(createIdFilter(id));
}

async function create(body) {
  const db = getDB();
  const fish = prepareFishData(body, true);

  if (body._id !== undefined && body._id !== "") {
    fish._id = String(body._id);
  }

  if (!fish.rarity) {
    fish.rarity = "common";
  }

  const result = await db.collection(collectionName).insertOne(fish);

  return {
    ...fish,
    _id: result.insertedId,
  };
}

async function updateById(id, body) {
  const db = getDB();
  const filter = createIdFilter(id);
  const updatedData = prepareFishData(body);

  if (Object.keys(updatedData).length === 0) {
    const err = new Error("Nepateikta duomenų atnaujinimui");
    err.status = 400;
    throw err;
  }

  const result = await db.collection(collectionName).updateOne(filter, {
    $set: updatedData,
  });

  if (result.matchedCount === 0) {
    return null;
  }

  return db.collection(collectionName).findOne(filter);
}

async function deleteById(id) {
  const db = getDB();
  const result = await db.collection(collectionName).deleteOne(createIdFilter(id));
  return result.deletedCount > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  updateById,
  deleteById,
};
