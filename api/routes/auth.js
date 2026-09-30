import express from "express";
import { register, login, logout, getSession } from "../controllers/authController.js";
import { requireSession, requireAuthRequest, createAuthRateLimit } from "../middleware/auth.js";

const router = express.Router();
const rateLimit = createAuthRateLimit();

router.post("/register", requireAuthRequest, rateLimit, register);
router.post("/login", requireAuthRequest, rateLimit, login);
router.post("/logout", requireAuthRequest, logout);
router.get("/me", requireSession, getSession);

export default router;
