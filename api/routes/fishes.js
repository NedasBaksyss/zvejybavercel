var express = require("express");
var router = express.Router();

const { getDB } = require("../db");

router.get("/", async function (req, res) {
  try {
    const db = getDB();

    const fishes = await db.collection("fish").find().toArray();

    res.json(fishes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to get fishes",
    });
  }
});

router.post("/", async function (req, res) {
  try {
    const db = getDB();

    const user = {
      name: req.body.name,
      score: req.body.score || 0,
    };

    const result = await db.collection("fishes").insertOne(fish);

    res.status(201).json({
      _id: result.insertedId,
      ...user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create fish",
    });
  }
});

module.exports = router;
