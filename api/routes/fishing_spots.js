import express from "express";

import {
  getFishingSpots,
  getFishingSpot,
  createFishingSpot,
  updateFishingSpot,
  updateFishingSpotSprite,
  deleteFishingSpot,
} from "../controllers/fishingSpotController.js";

const router = express.Router();

router.get("/", getFishingSpots);
router.get("/:id", getFishingSpot);
router.post("/", createFishingSpot);
router.put("/:id", updateFishingSpot);
router.put("/:id/sprite", updateFishingSpotSprite);
router.delete("/:id", deleteFishingSpot);

export default router;
