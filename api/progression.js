export const XP_PER_CATCH = 25;
export const XP_PER_LEVEL = 100;
export const COINS_PER_LEVEL = 50;
export const DEFAULT_FISH_VALUE = 5;

export const FISH_VALUES = {
  bleak: 5,
  roach: 6,
  gudgeon: 6,
  rudd: 7,
  carp: 8,
  mudskip: 9,
  bream: 10,
  perch: 12,
  tench: 14,
  chub: 16,
  trout: 18,
  grayling: 19,
  pike: 20,
  eel: 22,
  mistfin: 24,
  glowminnow: 26,
  zander: 28,
  salmon: 30,
  asp: 32,
  catfish: 35,
  embercarp: 38,
  crystalperch: 40,
  frosttrout: 42,
  shadowpike: 45,
  stormray: 70,
  moonbass: 75,
  ironjaw: 80,
  ghosteel: 85,
  mirrorcarp: 88,
  runefish: 90,
  firefin: 95,
  thunderfish: 100,
  sturgeon: 120,
  starfish: 180,
  cloudkoi: 200,
  timefish: 220,
  nightfish: 240,
  leviathan: 250,
  rainbow_shark: 260,
  goldfish_king: 280,
  abyss_king: 300,
  worldserpent: 350,
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