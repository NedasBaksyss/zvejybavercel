import express from "express";

import {
  getFishes,
  getFish,
  createFish,
  updateFish,
  updateFishSprite,
  deleteFish,
} from "../controllers/fishController.js";

const router = express.Router();

router.get("/", getFishes);
router.get("/:id", getFish);
router.post("/", createFish);
router.put("/:id", updateFish);
router.put("/:id/sprite", updateFishSprite);
router.delete("/:id", deleteFish);

export default router;
