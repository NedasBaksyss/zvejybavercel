import { WORLD, WORLD_TEXTURE, WORLD_SCALE } from "./mapData.js";
import { createTerrainGeometry } from "./terrain/terrainGeometry.jsx";
import { createCollisionMap } from "./terrain/createCollisionMap.jsx";
import { createTerrainTiles } from "./terrain/createTerrainTiles.jsx";
import { makeCanvas } from "./terrain/terrainUtils.jsx";
import { paintGround } from "./terrain/paintGround.jsx";
import { paintDetails } from "./terrain/paintDetails.jsx";

export { drawTree, drawShop } from "./terrain/terrainSprites.jsx";

export function createTerrain() {
  const geometry = createTerrainGeometry();
  const collision = createCollisionMap(geometry);
  const hit = makeCanvas(1, 1).getContext("2d");
  hit.lineWidth = 30;
  hit.lineCap = "round";
  const paint = (ctx, bounds) => {
    paintGround(ctx, bounds, geometry, collision.land);
    paintDetails(ctx, bounds, geometry, collision.land, hit);
  };
  const canvas = makeCanvas(WORLD_TEXTURE.width, WORLD_TEXTURE.height);
  const overview = canvas.getContext("2d", { willReadFrequently: true });
  overview.scale(1 / WORLD_SCALE, 1 / WORLD_SCALE);
  paint(overview, { x: 0, y: 0, width: WORLD.width, height: WORLD.height });
  const pixels = overview.getImageData(0, 0, canvas.width, canvas.height).data;
  const tiles = createTerrainTiles(canvas, paint);

  return {
    canvas,
    pixels,
    textureWidth: WORLD_TEXTURE.width,
    textureHeight: WORLD_TEXTURE.height,
    draw: tiles.draw,
    canWalk: collision.canWalk,
    clampPosition: collision.clampPosition,
    cacheInfo: () => ({
      ...tiles.cacheInfo(),
      collisionBytes: collision.collisionBytes,
    }),
    dispose() {
      tiles.dispose();
      canvas.width = canvas.height = 1;
    },
  };
}
