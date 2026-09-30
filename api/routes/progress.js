import express from "express";
import { createHash, randomUUID } from "node:crypto";
import User from "../models/user.js";
import { catchUpdate, XP_PER_CATCH, XP_PER_LEVEL } from "../progression.js";

const router = express.Router();
const profile = (user) => ({
  id: user._id, username: user.username, stats: user.stats,
  xpPerCatch: XP_PER_CATCH, xpPerLevel: XP_PER_LEVEL,
});

router.use((req, res, next) => {
  const token = req.get("Authorization")?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!token) return res.status(401).json({ error: "Guest profile key is required" });
  req.guestTokenHash = createHash("sha256").update(token).digest("hex");
  next();
});

router.post("/guest", async (req, res) => {
  try {
    const filter = { guestTokenHash: req.guestTokenHash };
    let user;
    try {
      user = await User.findOneAndUpdate(filter, { $setOnInsert: {
        ...filter, username: `guest-${randomUUID().slice(0, 18)}`, role: "guest",
      } }, { upsert: true, new: true, runValidators: true });
    } catch (error) {
      // Two tabs may initialize the same profile at once.
      if (error.code !== 11000) throw error;
      user = await User.findOne(filter);
      if (!user) throw error;
    }
    res.json(profile(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load guest progress" });
  }
});

router.post("/catches", async (req, res) => {
  const { catchId } = req.body;
  if (typeof catchId !== "string" || !/^[a-f0-9-]{36}$/.test(catchId)) {
    return res.status(400).json({ error: "A valid catch ID is required" });
  }
  try {
    const filter = { guestTokenHash: req.guestTokenHash };
    const updated = await User.findOneAndUpdate(
      { ...filter, catchReceipts: { $ne: catchId } }, catchUpdate(catchId),
      { new: true, updatePipeline: true },
    );
    const user = updated || await User.findOne(filter);
    if (!user) return res.status(404).json({ error: "Guest profile not found" });
    res.json({ ...profile(user), awardedXp: updated ? XP_PER_CATCH : 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not save catch progress" });
  }
});

export default router;
