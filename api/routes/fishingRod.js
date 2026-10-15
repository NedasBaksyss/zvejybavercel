const express = require("express");
const router = express.Router();

const fishingRodController = require(
  "../controllers/fishingRodController"
);

router.get("/", fishingRodController.getFishingRods);
router.get("/:id", fishingRodController.getFishingRodById);
router.post("/", fishingRodController.createFishingRod);
router.put("/:id", fishingRodController.updateFishingRod);
router.delete("/:id", fishingRodController.deleteFishingRod);

// Upload or replace sprite separately
router.put("/:id/sprite", fishingRodController.updateFishingRodSprite);

module.exports = router;