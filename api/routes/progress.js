import express from "express";
import { getGuestProgress, recordCatch } from "../controllers/progressController.js";
import { requireGuestProfile } from "../middleware/guestProfile.js";

const router = express.Router();

router.use(requireGuestProfile);
router.post("/guest", getGuestProgress);
router.post("/catches", recordCatch);

export default router;
