import express from "express";

import {
  getUsers,
  getUser,
  createUser,
  updateUserRole,
  updateUserStats,
  updateLastLogin,
  deleteUser
} from "../controllers/userController.js";

import { isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", isAdmin, getUsers);
router.get("/:id", isAdmin, getUser);

router.post("/", isAdmin, createUser);

router.patch("/:id/role", isAdmin, updateUserRole);
router.patch("/:id/stats", isAdmin, updateUserStats);
router.patch("/:id/login", isAdmin, updateLastLogin);

router.delete("/:id", isAdmin, deleteUser);

export default router;
