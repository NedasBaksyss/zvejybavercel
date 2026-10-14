function platform(id, x, y, width, scale, direction, target) {
  const facing = direction === "right" ? 1 : -1;
  const angler = {
    x: Math.round(x + width * 0.62),
    y: y - 10 * scale,
    direction,
  };
  return {
    id,
    x,
    y,
    width,
    scale,
    angler,
    target,
    rod: {
      tipX: angler.x + facing * 130 * scale,
      tipY: angler.y - 105 * scale,
    },
  };
}

export const LAKE_PLATFORMS = {
  "quiet-lake": [
    platform("near-bank", 40, 451, 200, 1, "right", { x: 548, y: 386 }),
    platform("west-bank", 12, 320, 160, 0.8, "right", { x: 270, y: 370 }),
    platform("east-bank", 780, 325, 164, 0.8, "left", { x: 725, y: 385 }),
  ],
  "pine-lake": [
    platform("near-bank", 714, 436, 200, 1, "left", { x: 440, y: 382 }),
    platform("cabin-bank", 20, 302, 156, 0.8, "right", { x: 235, y: 385 }),
    platform("east-bank", 786, 312, 158, 0.8, "left", { x: 755, y: 366 }),
  ],
  "reed-lake": [
    platform("near-bank", 17, 442, 200, 1, "right", { x: 560, y: 380 }),
    platform("west-reeds", 26, 310, 158, 0.8, "right", { x: 255, y: 380 }),
    platform("east-reeds", 778, 306, 166, 0.8, "left", { x: 690, y: 383 }),
  ],
  "meadow-lake": [
    platform("near-bank", 718, 448, 200, 1, "left", { x: 430, y: 390 }),
    platform("cabin-bank", 16, 313, 160, 0.8, "right", { x: 275, y: 372 }),
    platform("flower-bank", 780, 320, 162, 0.8, "left", { x: 720, y: 378 }),
  ],
  "highland-lake": [
    platform("near-bank", 74, 440, 200, 1, "right", { x: 590, y: 390 }),
    platform("west-rocks", 18, 323, 158, 0.8, "right", { x: 280, y: 380 }),
    platform("east-rocks", 786, 325, 158, 0.8, "left", { x: 720, y: 390 }),
  ],
  "sunset-lake": [
    platform("near-bank", 708, 450, 200, 1, "left", { x: 405, y: 395 }),
    platform("west-bank", 12, 330, 158, 0.8, "right", { x: 215, y: 385 }),
    platform("east-bank", 784, 330, 160, 0.8, "left", { x: 710, y: 392 }),
  ],
};

export function chooseLakePlatform(lakeId, random = Math.random, occupied = []) {
  const platforms = LAKE_PLATFORMS[lakeId]?.filter((item) => !occupied.includes(item.id));
  return platforms?.length ? platforms[Math.floor(random() * platforms.length)] : null;
}

export function getLakePlatform(lakeId, platformId) {
  const platforms = LAKE_PLATFORMS[lakeId];
  return platforms?.find((item) => item.id === platformId) || platforms?.[0];
}

export function isOnLakePlatform(lakeId, x, y) {
  return (LAKE_PLATFORMS[lakeId] || []).some(
    (p) =>
      x >= p.x - 5 &&
      x <= p.x + p.width + 5 &&
      y >= p.y - 5 &&
      y <= p.y + 38 * p.scale,
  );
}
