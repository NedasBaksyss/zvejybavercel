const express = require("express");
const router = express.Router();

const itemController = require("../controllers/itemController");

router.get("/", itemController.getItems);
router.get("/:id", itemController.getItemById);
router.post("/", itemController.createItem);
router.put("/:id", itemController.updateItem);
router.delete("/:id", itemController.deleteItem);

// Upload or replace sprite separately
router.put("/:id/sprite", itemController.updateItemSprite);

module.exports = router;