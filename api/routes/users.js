import express from "express";

import {
  getUsers,
  getUser,
  updateUserRole,
  updateUserStats,
  updateLastLogin,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.patch("/:id/role", updateUserRole);
router.patch("/:id/stats", updateUserStats);
router.patch("/:id/login", updateLastLogin);

export default router;
