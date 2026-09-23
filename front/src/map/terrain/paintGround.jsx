import { WORLD_SCALE, CLEARINGS } from "../mapData.js";
import { BRIDGES } from "./terrainGeometry.jsx";
import { noise, intersects } from "./terrainUtils.jsx";

export function paintGround(
  ctx,
  bounds,
  { paths, river, trails, lakes },
  land,
) {
  ctx.fillStyle = "#153e55";
  ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.save();
  ctx.scale(WORLD_SCALE, WORLD_SCALE);
  for (const path of paths) {
    ctx.strokeStyle = "#246875";
    ctx.lineWidth = 6;
    ctx.stroke(path);
    ctx.strokeStyle = "#5b9290";
    ctx.lineWidth = 2.5;
    ctx.stroke(path);
    ctx.strokeStyle = "#bec48a";
    ctx.lineWidth = 1.2;
    ctx.stroke(path);
    ctx.fillStyle = "#688958";
    ctx.fill(path);
    ctx.save();
    ctx.clip(path);
    ctx.fillStyle = "#8b9b64";
    ctx.fillRect(0, 400, 1600, 85);
    ctx.fillStyle = "#718752";
    ctx.fillRect(0, 485, 1600, 70);
    ctx.fillStyle = "#dce0c8";
    ctx.fillRect(0, 0, 1600, 124);
    ctx.fillRect(0, 735, 1600, 65);
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
      ctx.fillStyle = land(x, y)
        ? noise(gx, gy, 7) > 0.5
          ? "#b7be7d22"
          : "#3f724d28"
        : "#7cabb320";
      ctx.fillRect(x, y, 10 + noise(gx, gy, 8) * 17, land(x, y) ? 4 : 1);
    }
  }
  ctx.save();
  ctx.scale(WORLD_SCALE, WORLD_SCALE);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#abb480";
  ctx.lineWidth = 34 / WORLD_SCALE;
  ctx.stroke(river);
  ctx.strokeStyle = "#398c93";
  ctx.lineWidth = 24 / WORLD_SCALE;
  ctx.stroke(river);
  ctx.strokeStyle = "#256a80";
  ctx.lineWidth = 14 / WORLD_SCALE;
  ctx.stroke(river);
  ctx.restore();
  for (const { spot, path } of lakes) {
    if (!intersects(bounds, spot.x, spot.y, spot.radiusX + 15)) continue;
    ctx.strokeStyle = "#b5bb83";
    ctx.lineWidth = 10;
    ctx.stroke(path);
    ctx.fillStyle = "#398c93";
    ctx.fill(path);
    ctx.save();
    ctx.clip(path);
    ctx.fillStyle = "#266a83";
    ctx.beginPath();
    ctx.ellipse(
      spot.x - 5,
      spot.y - 6,
      spot.radiusX * 0.82,
      spot.radiusY * 0.8,
      -0.35,
      0,
      7,
    );
    ctx.fill();
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
    ctx.fillStyle = "#a8aa70";
    ctx.beginPath();
    ctx.ellipse(
      clearing.x,
      clearing.y,
      clearing.radius,
      clearing.radius * 0.74,
      0,
      0,
      7,
    );
    ctx.fill();
    ctx.strokeStyle = "#c6b67d";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = "#bdad76";
    ctx.fillRect(clearing.x - 18, clearing.y - 6, 36, 12);
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const path of trails) {
    ctx.strokeStyle = "#60764b";
    ctx.lineWidth = 22;
    ctx.stroke(path);
    ctx.strokeStyle = "#b6ae79";
    ctx.lineWidth = 16;
    ctx.stroke(path);
    ctx.strokeStyle = "#d7c48c";
    ctx.lineWidth = 2;
    ctx.stroke(path);
  }
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
