const express = require("express");
const router = express.Router();

const baitController = require("../controllers/baitController");

router.get("/", baitController.getBaits);
router.get("/:id", baitController.getBaitById);
router.post("/", baitController.createBait);
router.put("/:id", baitController.updateBait);
router.delete("/:id", baitController.deleteBait);

// Sprite is uploaded independently of bait data
router.put("/:id/sprite", baitController.updateBaitSprite);

module.exports = router;