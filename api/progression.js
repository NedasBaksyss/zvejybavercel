export const XP_PER_CATCH = 25;
export const XP_PER_LEVEL = 100;

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

// A single MongoDB update awards XP and records the receipt atomically.
export function catchUpdate(catchId) {
  const experience = { $add: [{ $ifNull: ["$stats.experience", 0] }, XP_PER_CATCH] };
  return [{ $set: {
    "stats.level": { $add: [
      { $max: [1, { $ifNull: ["$stats.level", 1] }] },
      { $floor: { $divide: [experience, XP_PER_LEVEL] } },
    ] },
    "stats.experience": { $mod: [experience, XP_PER_LEVEL] },
    "stats.totalFishCaught": { $add: [{ $ifNull: ["$stats.totalFishCaught", 0] }, 1] },
    "stats.coins": { $ifNull: ["$stats.coins", 0] },
    catchReceipts: { $concatArrays: [{ $ifNull: ["$catchReceipts", []] }, [catchId]] },
  } }];
}
