import express from "express";

import {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  updateAchievementSprite,
  deleteAchievement,
} from "../controllers/achievementController.js";

const router = express.Router();

// GET /api/achievements
router.get("/", getAchievements);

// GET /api/achievements/:id
router.get("/:id", getAchievement);

// POST /api/achievements
router.post("/", createAchievement);

// PUT /api/achievements/:id
router.put("/:id", updateAchievement);

// PUT /api/achievements/:id/sprite
router.put("/:id/sprite", updateAchievementSprite);

// DELETE /api/achievements/:id
router.delete("/:id", deleteAchievement);

export default router;
