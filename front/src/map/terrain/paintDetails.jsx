import { LOCATIONS, CLEARINGS } from "../mapData.js";
import { drawTree, drawShop } from "./terrainSprites.jsx";
import { noise, intersects } from "./terrainUtils.jsx";

export function paintDetails(ctx, bounds, { trails }, land, hit) {
  const cell = 28;
  for (
    let gy = Math.floor((bounds.y - 24) / cell);
    gy <= Math.ceil((bounds.y + bounds.height + 24) / cell);
    gy++
  ) {
    for (
      let gx = Math.floor((bounds.x - 24) / cell);
      gx <= Math.ceil((bounds.x + bounds.width + 24) / cell);
      gx++
    ) {
      if (noise(gx, gy, 18) < 0.48) continue;
      const x = gx * cell + noise(gx, gy, 2) * 22,
        y = gy * cell + noise(gx, gy, 3) * 22;
      if (
        !land(x, y) ||
        LOCATIONS.some(
          (place) => Math.hypot(x - place.entry.x, y - place.entry.y) < 42,
        ) ||
        CLEARINGS.some(
          (clearing) =>
            Math.hypot(x - clearing.x, y - clearing.y) < clearing.radius + 15,
        ) ||
        trails.some((path) => hit.isPointInStroke(path, x, y))
      )
        continue;
      drawTree(ctx, x, y, 0.7 + noise(gx, gy, 4) * 0.7);
    }
  }
  for (let i = 0; i < 25; i++) {
    const x = 3830 + i * 35,
      y = 692 + Math.sin(i * 1.5) * 44;
    if (!intersects(bounds, x, y, 38)) continue;
    ctx.fillStyle = "#567264";
    ctx.beginPath();
    ctx.moveTo(x, y - 38);
    ctx.lineTo(x - 27, y + 10);
    ctx.lineTo(x + 29, y + 10);
    ctx.fill();
    ctx.fillStyle = "#91a18a";
    ctx.beginPath();
    ctx.moveTo(x, y - 38);
    ctx.lineTo(x - 27, y + 10);
    ctx.lineTo(x, y + 4);
    ctx.fill();
    ctx.fillStyle = "#d8dfc8";
    ctx.beginPath();
    ctx.moveTo(x, y - 38);
    ctx.lineTo(x - 8, y - 22);
    ctx.lineTo(x + 8, y - 23);
    ctx.fill();
  }
  for (const place of LOCATIONS) {
    if (!intersects(bounds, place.x, place.y, 140)) continue;
    if (place.type === "shop") drawShop(ctx, place.x, place.y, 1.1);
    if (place.type === "waterfall") {
      ctx.fillStyle = "#658875";
      ctx.fillRect(place.x - 22, place.y - 18, 44, 20);
      ctx.fillStyle = "#b1e2da";
      ctx.fillRect(place.x - 8, place.y - 23, 16, 38);
      ctx.fillStyle = "#ecf1d3";
      ctx.fillRect(place.x - 4, place.y - 23, 4, 38);
      ctx.fillRect(place.x - 14, place.y + 15, 28, 4);
    }
    if (place.type === "lake") {
      ctx.fillStyle = "#a88a54";
      ctx.fillRect(place.entry.x - 5, place.entry.y - 17, 10, 21);
      ctx.fillStyle = "#655234";
      for (let y = 0; y < 20; y += 4)
        ctx.fillRect(place.entry.x - 5, place.entry.y - 16 + y, 10, 1);
    }
  }
}
