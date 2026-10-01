import express from "express";

import {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  updateAchievementSprite,
  deleteAchievement,

  addRequirement,
  deleteRequirement,

  addReward,
  updateReward,
  deleteReward,
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
router.post("/:id/requirements", addRequirement);
router.delete("/:id/requirements", deleteRequirement);

// Rewards
router.post("/:id/rewards", addReward);
router.put("/:id/rewards/:rewardIndex", updateReward);
router.delete("/:id/rewards/:rewardIndex", deleteReward);

export default router;
