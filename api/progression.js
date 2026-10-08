export const XP_PER_CATCH = 25;
export const XP_PER_LEVEL = 100;
export const COINS_PER_LEVEL = 50;
export const DEFAULT_FISH_VALUE = 5;

export const FISH_VALUES = {
  carp: 8,
  perch: 12,
  pike: 20,
  trout: 18,
  salmon: 30,
};

export function fishValue(fishType) {
  if (typeof fishType !== "string") return DEFAULT_FISH_VALUE;
  return FISH_VALUES[fishType] ?? DEFAULT_FISH_VALUE;
}

export function validateStats(input) {
  const update = {};
  for (const field of ["totalFishCaught", "coins", "level", "experience"]) {
    if (input[field] === undefined) continue;
    const value = input[field];
    const min = field === "level" ? 1 : 0;
    const max = field === "experience" ? XP_PER_LEVEL - 1 : 1_000_000_000;
    if (!Number.isSafeInteger(value) || value < min || value > max) {
      throw new Error(`${field} must be a whole number from ${min} to ${max}`);
    }
    update[`stats.${field}`] = value;
  }
  if (!Object.keys(update).length) throw new Error("No stats provided");
  return update;
}

export function catchUpdate(catchId, fishType) {
  const payout = fishValue(fishType);
  const experience = { $add: [{ $ifNull: ["$stats.experience", 0] }, XP_PER_CATCH] };
  const levelsGained = { $floor: { $divide: [experience, XP_PER_LEVEL] } };
  return [{
    $set: {
      "stats.level": {
        $add: [
          { $max: [1, { $ifNull: ["$stats.level", 1] }] },
          levelsGained,
        ],
      },
      "stats.experience": { $mod: [experience, XP_PER_LEVEL] },
      "stats.totalFishCaught": { $add: [{ $ifNull: ["$stats.totalFishCaught", 0] }, 1] },
      "stats.coins": {
        $add: [
          { $ifNull: ["$stats.coins", 0] },
          payout,
          { $multiply: [levelsGained, COINS_PER_LEVEL] },
        ],
      },
      catchReceipts: {
        $concatArrays: [{ $ifNull: ["$catchReceipts", []] }, [catchId]],
      },
    },
  }];
}