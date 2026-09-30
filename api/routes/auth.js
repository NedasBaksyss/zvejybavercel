import express from "express";


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

router.post("/register", registerValidator(), register);
router.post("/user/login", loginUserValidator(), loginUser);
router.post("/admin/login", loginAdminValidator(), loginAdmin);
router.get("/me", isAuth, me );

export default router;
