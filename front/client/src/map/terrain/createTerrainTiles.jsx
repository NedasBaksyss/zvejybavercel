import { WORLD } from "../mapData.js";
import { makeCanvas } from "./terrainUtils.jsx";

const TILE_SIZE = 512;
const MAX_TILES = 24;

export function createTerrainTiles(canvas, paint) {
  const tiles = new Map();
  let mediumOverview;
  function getOverview(zoom) {
    if (zoom <= canvas.width / WORLD.width) return canvas;
    if (!mediumOverview) {
      mediumOverview = makeCanvas(WORLD.width / 2, WORLD.height / 2);
      const context = mediumOverview.getContext("2d");
      context.scale(0.5, 0.5);
      paint(context, { x: 0, y: 0, width: WORLD.width, height: WORLD.height });
    }
    return mediumOverview;
  }
  function getTile(tx, ty) {
    const key = `${tx}:${ty}`;
    if (tiles.has(key)) {
      const tile = tiles.get(key);
      tiles.delete(key);
      tiles.set(key, tile);
      return tile;
    }
    const tile = makeCanvas(TILE_SIZE, TILE_SIZE);
    const context = tile.getContext("2d");
    context.translate(-tx * TILE_SIZE, -ty * TILE_SIZE);
    const bounds = {
      x: tx * TILE_SIZE,
      y: ty * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
    };
    paint(context, bounds);
    tiles.set(key, tile);
    if (tiles.size > MAX_TILES) {
      const first = tiles.keys().next().value;
      const old = tiles.get(first);
      tiles.delete(first);
      old.width = old.height = 1;
    }
    return tile;
  }
  return {
    draw(ctx, camera, zoom, width, height) {
      const left = camera.x - width / zoom / 2,
        top = camera.y - height / zoom / 2;
      ctx.save();
      // Filter terrain while shrinking it; restore the sprite renderer's settings.
      ctx.imageSmoothingEnabled = zoom < 1;
      ctx.imageSmoothingQuality = "high";
      if (zoom <= 0.5) {
        ctx.drawImage(
          getOverview(zoom),
          -left * zoom,
          -top * zoom,
          WORLD.width * zoom,
          WORLD.height * zoom,
        );
        ctx.restore();
        return;
      }
      const x1 = Math.max(0, Math.floor(left / TILE_SIZE)),
        y1 = Math.max(0, Math.floor(top / TILE_SIZE));
      const x2 = Math.min(
        Math.ceil(WORLD.width / TILE_SIZE) - 1,
        Math.floor((left + width / zoom) / TILE_SIZE),
      );
      const y2 = Math.min(
        Math.ceil(WORLD.height / TILE_SIZE) - 1,
        Math.floor((top + height / zoom) / TILE_SIZE),
      );
      for (let ty = y1; ty <= y2; ty++)
        for (let tx = x1; tx <= x2; tx++) {
          const tile = getTile(tx, ty),
            x = tx * TILE_SIZE,
            y = ty * TILE_SIZE;
          const w = Math.min(TILE_SIZE, WORLD.width - x),
            h = Math.min(TILE_SIZE, WORLD.height - y);
          const dx = Math.round((x - left) * zoom),
            dy = Math.round((y - top) * zoom);
          const dw = Math.round((x + w - left) * zoom) - dx,
            dh = Math.round((y + h - top) * zoom) - dy;
          ctx.drawImage(tile, 0, 0, w, h, dx, dy, dw, dh);
        }
      ctx.restore();
    },

    cacheInfo: () => ({ tiles: tiles.size, limit: MAX_TILES }),
    dispose() {
      for (const tile of tiles.values()) tile.width = tile.height = 1;
      tiles.clear();
      if (mediumOverview) mediumOverview.width = mediumOverview.height = 1;
      mediumOverview = undefined;
    },
  };
}
