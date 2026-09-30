import express from "express";
import { getGuestProgress, getAccountProgress, recordCatch } from "../controllers/progressController.js";
import { requireGuestProfile } from "../middleware/guestProfile.js";
import { requireSession, requireAuthRequest, requireAccountMatch } from "../middleware/auth.js";

const router = express.Router();

router.post("/guest", requireGuestProfile, getGuestProgress);
router.post("/catches", requireGuestProfile, recordCatch);
router.post("/account", requireAuthRequest, requireSession, requireAccountMatch, getAccountProgress);
router.post("/account/catches", requireAuthRequest, requireSession, requireAccountMatch, recordCatch);

export default router;
