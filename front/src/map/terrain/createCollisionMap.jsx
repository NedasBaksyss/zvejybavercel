import { WORLD, WORLD_TEXTURE, WORLD_SCALE, clamp } from "../mapData.js";
import { BRIDGES } from "./terrainGeometry.jsx";
import { makeCanvas } from "./terrainUtils.jsx";

export function createCollisionMap({ paths, river, lakes }) {
  const mask = makeCanvas(WORLD_TEXTURE.width, WORLD_TEXTURE.height);
  const collision = mask.getContext("2d", { willReadFrequently: true });
  collision.fillStyle = "black";
  collision.fillRect(0, 0, mask.width, mask.height);
  collision.fillStyle = "white";
  paths.forEach((path) => collision.fill(path));
  collision.lineCap = "round";
  collision.strokeStyle = "black";
  collision.lineWidth = 24 / WORLD_SCALE;
  collision.stroke(river);
  collision.save();
  collision.scale(1 / WORLD_SCALE, 1 / WORLD_SCALE);
  collision.fillStyle = "black";
  lakes.forEach(({ path }) => collision.fill(path));
  collision.fillStyle = "white";
  BRIDGES.forEach((bridge) =>
    collision.fillRect(bridge.x, bridge.y, bridge.width, bridge.height),
  );
  collision.restore();
  const rgba = collision.getImageData(0, 0, mask.width, mask.height).data;
  const walkable = new Uint8Array(mask.width * mask.height);
  for (let i = 0; i < walkable.length; i++)
    walkable[i] = rgba[i * 4] > 180 ? 1 : 0;
  const land = (x, y) =>
    x >= 0 &&
    y >= 0 &&
    x < WORLD.width &&
    y < WORLD.height &&
    walkable[
      Math.floor(y / WORLD_SCALE) * WORLD_TEXTURE.width +
        Math.floor(x / WORLD_SCALE)
    ] === 1;
  mask.width = mask.height = 1;
  return {
    land,
    collisionBytes: walkable.byteLength,
    canWalk(x, y) {
      return [
        [0, 0],
        [-5, 0],
        [5, 0],
        [0, -5],
        [0, 5],
      ].every(([dx, dy]) => land(x + dx, y + dy));
    },
    clampPosition(point) {
      return {
        x: clamp(point.x, 6, WORLD.width - 6),
        y: clamp(point.y, 6, WORLD.height - 6),
      };
    },
  };
}
