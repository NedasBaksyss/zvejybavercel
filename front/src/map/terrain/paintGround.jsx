import { WORLD_SCALE, CLEARINGS } from "../mapData.js";
import { BRIDGES } from "./terrainGeometry.jsx";
import { noise, intersects } from "./terrainUtils.jsx";
import { isWinter, winterPath } from "./winterRegion.js";

export function paintGround(
  ctx,
  bounds,
  { paths, river, trails, lakes },
  land,
) {
  ctx.fillStyle = "#173f4a";
  ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.save();
  ctx.scale(WORLD_SCALE, WORLD_SCALE);
  for (const path of paths) {
    ctx.strokeStyle = "#245561";
    ctx.lineWidth = 10;
    ctx.stroke(path);
    ctx.strokeStyle = "#4c8582";
    ctx.lineWidth = 4;
    ctx.stroke(path);
    ctx.strokeStyle = "#c2c097";
    ctx.lineWidth = 1.2;
    ctx.stroke(path);
    ctx.fillStyle = "#829b72";
    ctx.fill(path);
    ctx.save();
    ctx.clip(path);
    // Broad, overlapping meadows replace the horizontal biome bands.
    for (let y = 80; y < 800; y += 75) {
      for (let x = 40; x < 1600; x += 85) {
        const px = x + noise(x, y, 3) * 65, py = y + noise(x, y, 4) * 55;
        const radius = 45 + noise(x, y, 5) * 65;
        if (!intersects(bounds, px * WORLD_SCALE, py * WORLD_SCALE, radius * WORLD_SCALE)) continue;
        const wash = ctx.createRadialGradient(px, py, 0, px, py, radius);
        wash.addColorStop(0, noise(x, y, 6) > .5 ? "#d8c68a80" : "#346b5866");
        wash.addColorStop(1, "#829b7200");
        ctx.fillStyle = wash;
        ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
      }
    }
    ctx.fillStyle = "#dce0c8";
    ctx.fillRect(0, 0, 1600, 124);
    ctx.fillRect(0, 735, 1600, 65);
    const snow = winterPath(WORLD_SCALE);
    ctx.strokeStyle = "#b9c9ae55";
    ctx.lineWidth = 12;
    ctx.stroke(snow);
    ctx.strokeStyle = "#cbd8c4aa";
    ctx.lineWidth = 5;
    ctx.stroke(snow);
    ctx.fillStyle = "#dfebe6";
    ctx.fill(snow);
    ctx.restore();
  }
  ctx.restore();
  for (
    let gy = Math.floor((bounds.y - 48) / 48);
    gy <= Math.ceil((bounds.y + bounds.height + 48) / 48);
    gy++
  ) {
    for (
      let gx = Math.floor((bounds.x - 48) / 48);
      gx <= Math.ceil((bounds.x + bounds.width + 48) / 48);
      gx++
    ) {
      const x = gx * 48 + noise(gx, gy) * 30,
        y = gy * 48 + noise(gx, gy, 12) * 30;
      ctx.fillStyle = land(x, y) && isWinter(x, y)
        ? noise(gx, gy, 7) > 0.5 ? "#f7faf080" : "#97b4c13a"
        : land(x, y)
        ? noise(gx, gy, 7) > 0.5
          ? "#b7be7d22"
          : "#3f724d28"
        : "#7cabb320";
      ctx.fillRect(x, y, 10 + noise(gx, gy, 8) * 17, land(x, y) ? 4 : 1);
    }
  }
  ctx.save();
  ctx.scale(WORLD_SCALE, WORLD_SCALE);
  // Clip banks to the continent: no outlined river tube floating in the sea.
  const mainland = new Path2D();
  paths.forEach((path) => mainland.addPath(path));
  ctx.clip(mainland);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#c0bd91";
  ctx.lineWidth = 34 / WORLD_SCALE;
  ctx.stroke(river);
  ctx.save();
  ctx.clip(winterPath(WORLD_SCALE));
  ctx.strokeStyle = "#eef5ec";
  ctx.stroke(river);
  ctx.restore();
  ctx.restore();
  ctx.save();
  ctx.scale(WORLD_SCALE, WORLD_SCALE);
  // The channel darkens into the ocean and erases the coast at its mouth.
  const riverWater = ctx.createLinearGradient(0, 399, 0, 420);
  riverWater.addColorStop(0, "#519995");
  riverWater.addColorStop(1, "#173f4a");
  ctx.strokeStyle = riverWater;
  ctx.lineWidth = 24 / WORLD_SCALE;
  ctx.lineCap = "round";
  ctx.stroke(river);
  const current = ctx.createLinearGradient(0, 395, 0, 420);
  current.addColorStop(0, "#307579");
  current.addColorStop(1, "#173f4a");
  ctx.strokeStyle = current;
  ctx.lineWidth = 12 / WORLD_SCALE;
  ctx.stroke(river);
  ctx.restore();
  for (const { spot, path } of lakes) {
    if (!intersects(bounds, spot.x, spot.y, Math.max(spot.radiusX, spot.radiusY) + 20)) continue;
    ctx.strokeStyle = isWinter(spot.x, spot.y) ? "#f0f5eb" : "#c8c39b";
    ctx.lineWidth = 10;
    ctx.stroke(path);
    ctx.fillStyle = spot.waterColor;
    ctx.fill(path);
    ctx.save();
    ctx.clip(path);
    const depth = ctx.createRadialGradient(spot.x - 12, spot.y - 15, 0,
      spot.x, spot.y, Math.max(spot.radiusX, spot.radiusY));
    depth.addColorStop(0, "#143c5377");
    depth.addColorStop(.65, "#245b6633");
    depth.addColorStop(1, "#b5d9bb88");
    ctx.fillStyle = depth;
    ctx.fillRect(spot.x - spot.radiusX - spot.radiusY, spot.y - spot.radiusX - spot.radiusY,
      (spot.radiusX + spot.radiusY) * 2, (spot.radiusX + spot.radiusY) * 2);
    ctx.fillStyle = "#75b8b0";
    for (let i = 0; i < 60; i++)
      ctx.fillRect(
        spot.x + (noise(spot.x, i) - 0.5) * spot.radiusX * 2,
        spot.y + (noise(i, spot.y) - 0.5) * spot.radiusY * 2,
        3 + (i % 8),
        1,
      );
    ctx.restore();
  }
  for (const clearing of CLEARINGS) {
    if (!intersects(bounds, clearing.x, clearing.y, clearing.radius)) continue;
    const meadow = ctx.createRadialGradient(clearing.x, clearing.y, 8,
      clearing.x, clearing.y, clearing.radius);
    meadow.addColorStop(0, "#b0ad7666");
    meadow.addColorStop(1, "#b0ad7600");
    ctx.fillStyle = meadow;
    ctx.fillRect(clearing.x - clearing.radius, clearing.y - clearing.radius,
      clearing.radius * 2, clearing.radius * 2);
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const path of trails) {
    ctx.strokeStyle = "#59765a55";
    ctx.lineWidth = 18;
    ctx.stroke(path);
    ctx.strokeStyle = "#d0b894";
    ctx.lineWidth = 10;
    ctx.stroke(path);
  }
  ctx.save();
  ctx.clip(winterPath());
  for (const path of trails) {
    ctx.strokeStyle = "#a8bbbc";
    ctx.lineWidth = 14;
    ctx.stroke(path);
    ctx.strokeStyle = "#cedbd5";
    ctx.lineWidth = 8;
    ctx.stroke(path);
  }
  ctx.restore();
  for (const bridge of BRIDGES) {
    ctx.fillStyle = "#735f43";
    ctx.fillRect(bridge.x, bridge.y, bridge.width, bridge.height);
    for (let x = bridge.x + 3; x < bridge.x + bridge.width - 3; x += 5) {
      ctx.fillStyle = "#c7a274";
      ctx.fillRect(x, bridge.y + 3, 4, bridge.height - 6);
    }
    ctx.fillStyle = "#514a38";
    ctx.fillRect(bridge.x - 2, bridge.y, bridge.width + 4, 2);
    ctx.fillRect(
      bridge.x - 2,
      bridge.y + bridge.height - 2,
      bridge.width + 4,
      2,
    );
  }
}
