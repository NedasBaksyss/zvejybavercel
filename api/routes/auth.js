import express from "express";
import { getGameSession, logout } from "../controllers/sessionController.js";
import { requireSession, requireAuthRequest, createAuthRateLimit } from "../middleware/auth.js";


import {
  registerValidator,
  loginUserValidator,
  loginAdminValidator,
  register,
  loginUser,
  loginAdmin,
  isAuth,
  me,
} from "../controllers/authController.js";


const router = express.Router();
const rateLimit = createAuthRateLimit();

router.post("/register", rateLimit, registerValidator(), register);
router.post("/user/login", requireAuthRequest, rateLimit, loginUserValidator(), loginUser);
router.post("/admin/login", loginAdminValidator(), loginAdmin);
router.get("/me", isAuth, me );
router.get("/session", requireSession, getGameSession);
router.post("/logout", requireAuthRequest, logout);

export default router;
