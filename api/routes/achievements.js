import express from "express";

import {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  updateAchievementSprite,
  deleteAchievement,

  updateRequirements,
  deleteRequirements,

  updateRewards,
  deleteRewards

} from "../controllers/achievementController.js";

const router = express.Router();

// Achievements
router.get("/", getAchievements);
router.get("/:id", getAchievement);
router.post("/", createAchievement);
router.put("/:id", updateAchievement);
router.delete("/:id", deleteAchievement);

// Sprite
router.put("/:id/sprite", updateAchievementSprite);

// Requirements
router.put("/:id/requirements", updateRequirements);
router.delete("/:id/requirements", deleteRequirements);

// Rewards
router.put("/:id/rewards", updateRewards);
router.delete("/:id/rewards", deleteRewards);

export default router;
