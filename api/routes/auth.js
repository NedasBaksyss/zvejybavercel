import express from "express";
import { register, login, logout, getSession } from "../controllers/authController.js";
import { requireSession, requireAuthRequest, createAuthRateLimit } from "../middleware/auth.js";

const router = express.Router();
const rateLimit = createAuthRateLimit();

router.post("/register", requireAuthRequest, rateLimit, register);
router.post("/login", requireAuthRequest, rateLimit, login);
router.post("/logout", requireAuthRequest, logout);
router.get("/me", requireSession, getSession);

import {
  registerValidator,
  loginValidator,
  register,
  login,
  isAuth,
  me,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerValidator(), register);
router.post("/login", loginValidator(), login);
router.get("/me", isAuth, me );

export default router;
