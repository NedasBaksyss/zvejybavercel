import express from "express";


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
