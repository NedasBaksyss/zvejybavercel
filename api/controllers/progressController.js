import { randomUUID } from "node:crypto";
import User from "../models/user.js";
import { catchUpdate, fishValue, XP_PER_CATCH, XP_PER_LEVEL, COINS_PER_LEVEL } from "../progression.js";

const profile = (user) => ({
  id: user._id,
  username: user.username,
  stats: user.stats,
  xpPerCatch: XP_PER_CATCH,
  xpPerLevel: XP_PER_LEVEL,
  coinsPerLevel: COINS_PER_LEVEL,
});

export const getAccountProgress = (req, res) => res.json(profile(req.user));

export const getGuestProgress = async (req, res) => {
  try {
    const filter = { guestTokenHash: req.guestTokenHash };
    let user;
    try {
        user = await User.findOneAndUpdate(
          filter,
          {
            $set: {
              lastLogin: new Date(),
            },
            $setOnInsert: {
              ...filter,
              username: `guest-${randomUUID().slice(0, 18)}`,
              role: "guest",
            },
          },
          {
            upsert: true,
            new: true,
            runValidators: true,
          }
        );
    } catch (error) {
      if (error.code !== 11000) throw error;
      user = await User.findOne(filter);
      if (!user) throw error;
    }
    res.json(profile(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load guest progress" });
  }
};

export const recordCatch = async (req, res) => {
  const { catchId, fish } = req.body;
  if (typeof catchId !== "string" || !/^[a-f0-9-]{36}$/.test(catchId)) {
    return res.status(400).json({ error: "A valid catch ID is required" });
  }
  const fishType = typeof fish === "string" ? fish : null;
  try {
    const filter = req.user ? { _id: req.user._id } : { guestTokenHash: req.guestTokenHash };
    const previous = await User.findOne(filter);
    const prevLevel = previous?.stats?.level ?? 1;
    const prevCoins = previous?.stats?.coins ?? 0;
    const updated = await User.findOneAndUpdate(
      { ...filter, catchReceipts: { $ne: catchId } },
      catchUpdate(catchId, fishType),
      { new: true, updatePipeline: true },
    );
    const user = updated || previous;
    if (!user) return res.status(404).json({ error: "Guest profile not found" });
    const awardedXp = updated ? XP_PER_CATCH : 0;
    const awardedCoins = updated ? Math.max(0, (user.stats?.coins ?? 0) - prevCoins) : 0;
    const leveledUp = updated ? (user.stats?.level ?? 1) > prevLevel : false;
    res.json({
      ...profile(user),
      awardedXp,
      awardedCoins,
      leveledUp,
      fishPayout: updated ? fishValue(fishType) : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not save catch progress" });
  }
};