import express from "express";
const router = express.Router();

import { ObjectId } from "mongodb";
import { getDB } from "../db.js";

function createIdFilter(id) {
  if (ObjectId.isValid(id)) {
    return {
      $or: [{ _id: id }, { _id: new ObjectId(id) }],
    };
  }

  return { _id: id };
}

router.get("/", async function (req, res) {
  try {
    const db = getDB();

    const users = await db.collection("users").find().toArray();

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to get users",
    });
  }
});

router.get("/:id", async function (req, res) {
  try {
    const db = getDB();
    const filter = createIdFilter(req.params.id);
    console.log(filter)

    const user = await db.collection("users").findOne(filter);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to get user with Id",
    });
  }
});

router.patch("/:id/role", async function (req, res) {
  try {
    const db = getDB();

    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        error: "Role is required",
      });
    }

    const allowedRoles = ["admin", "user"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
      });
    }

    const filter = createIdFilter(id);

    const result = await db.collection("users").updateOne(
      filter,
      {
        $set: {
          role: role,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const updatedUser = await db.collection("users").findOne(filter);

    res.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update user role",
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

    const result = await db.collection("users").insertOne(user);

    res.status(201).json({
      _id: result.insertedId,
      ...user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create user",
    });
  }
});

export default router;
