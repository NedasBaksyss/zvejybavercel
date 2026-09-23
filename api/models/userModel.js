const { getDB } = require("../db");

const collectionName = "users";

async function findAll() {
  const db = getDB();
  return db.collection(collectionName).find().toArray();
}

async function create(body) {
  const db = getDB();

  const user = {
    name: body.name,
    score: body.score || 0,
  };

  const result = await db.collection(collectionName).insertOne(user);

  return {
    _id: result.insertedId,
    ...user,
  };
}

module.exports = {
  findAll,
  create,
};
