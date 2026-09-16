import {
  WORLD,
  VIEW,
  LOCATIONS,
  MAP_TEXT,
  GLOBE_START,
  GLOBE_END,
  clamp,
  mix,
  smooth,
  globePoint,
} from "./mapData.js";
import { createTerrain, drawShop, drawTree } from "./mapTerrain.js";

export function createMapRenderer(canvas, getLanguage) {
  const ctx = canvas.getContext("2d");
  const terrain = createTerrain();
  const sphere = document.createElement("canvas");
  sphere.width = sphere.height = 280;
  const sphereCtx = sphere.getContext("2d");
  const sphereImage = sphereCtx.createImageData(280, 280);
  const samples = [];
  for (let y = 0; y < 280; y++)
    for (let x = 0; x < 280; x++) {
      const nx = (x + 0.5 - 140) / 139,
        ny = (140 - y - 0.5) / 139;
      const square = nx * nx + ny * ny;
      if (square > 1) continue;
      const z = Math.sqrt(1 - square);
      samples.push({
        offset: (y * 280 + x) * 4,
        nx,
        ny,
        z,
        light: clamp(
          0.42 + 0.67 * (-nx * 0.45 + ny * 0.55 + z * 0.7),
          0.25,
          1.12,
        ),
        rim: Math.pow(1 - z, 4) * 0.58,
      });
    }
  let cachedLon = NaN,
    cachedLat = NaN;
  let markerHits = [];
  const center = { x: 392, y: 294 };
  const text = () => MAP_TEXT[getLanguage()] || MAP_TEXT.EN;

  function label(value, x, y, color = "#e8ead0", selected = false) {
    ctx.font = "13px ui-monospace, monospace";
    const width = ctx.measureText(value).width + 14;
    const left = Math.round(clamp(x - width / 2, 5, VIEW.width - width - 5));
    ctx.fillStyle = selected ? "#233f37f5" : "#102c32e8";
    ctx.fillRect(left, Math.round(y), width, 22);
    ctx.strokeStyle = selected ? "#e6c48d" : "#527568";
    ctx.lineWidth = 1;
    ctx.strokeRect(left + 0.5, Math.round(y) + 0.5, width, 22);
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.fillText(value, left + 7, y + 15);
  }

  function drawCharacter(x, y, time, moving, direction) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    const step = moving ? Math.sin(time * 16) * 2 : 0;
    ctx.fillStyle = "#0d2e3755";
    ctx.beginPath();
    ctx.ellipse(0, 8, 11, 4, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#283845";
    ctx.fillRect(-6, 3, 4, 7 + step);
    ctx.fillRect(2, 3, 4, 7 - step);
    ctx.fillStyle = "#df9b66";
    ctx.fillRect(-7, -6, 14, 12);
    ctx.fillStyle = "#f3cba0";
    ctx.fillRect(-5, -15, 10, 9);
    ctx.fillRect(-10, -3 + step, 3, 7);
    ctx.fillRect(7, -3 - step, 3, 7);
    ctx.fillStyle = "#425952";
    ctx.fillRect(-6, -20, 12, 7);
    ctx.fillRect(-10, -15, 20, 3);
    ctx.fillStyle = "#d8b97e";
    ctx.fillRect(-6, -16, 12, 2);
    ctx.fillStyle = "#273c3a";
    if (direction !== "up") {
      ctx.fillRect(direction === "left" ? -5 : 2, -11, 2, 2);
    }
    ctx.strokeStyle = "#76553b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 3);
    ctx.lineTo(16, -24);
    ctx.stroke();
    ctx.restore();
  }

  function drawFlat(state, time, blend) {
    const camera = {
      x: mix(state.camera.x, WORLD.width / 2, blend * 0.65),
      y: mix(state.camera.y, WORLD.height / 2, blend * 0.65),
    };
    const point = (p) => ({
      x: VIEW.width / 2 + (p.x - camera.x) * state.zoom,
      y: VIEW.height / 2 + (p.y - camera.y) * state.zoom,
    });
    ctx.save();
    ctx.globalAlpha = 1 - blend;
    ctx.imageSmoothingEnabled = false;
    terrain.draw(ctx, camera, state.zoom, VIEW.width, VIEW.height);
    for (const place of LOCATIONS) {
      const p = point(place),
        entry = point(place.entry);
      const selected = state.selectedId === place.id;
      const visible = (at) =>
        at.x >= -60 &&
        at.x <= VIEW.width + 60 &&
        at.y >= 55 &&
        at.y <= VIEW.height - 35;
      if (!visible(p) && !visible(entry)) continue;
      if (place.type !== "shop") {
        ctx.fillStyle = "#c5e9d580";
        for (let i = 0; i < 3; i++)
          ctx.fillRect(
            p.x - 12 + Math.sin(time * 1.2 + i) * 5,
            p.y + i * 7 - 8,
            10 + i * 3,
            1,
          );
      }
      ctx.strokeStyle = selected ? "#f3cf83" : "#d0e5b9";
      ctx.lineWidth = selected ? 2 : 1;
      ctx.beginPath();
      ctx.ellipse(entry.x, entry.y, 8 + Math.sin(time * 2) * 1.5, 4, 0, 0, 7);
      ctx.stroke();
      const anchor = place.type === "shop" ? p : entry;
      if ((state.zoom > 0.7 || selected) && visible(anchor))
        label(
          place.name[getLanguage()],
          anchor.x,
          anchor.y - (place.type === "shop" ? 28 * state.zoom + 28 : 37),
          undefined,
          selected,
        );
      markerHits.push({ id: place.id, x: p.x, y: p.y, radius: 26 });
      markerHits.push({ id: place.id, x: entry.x, y: entry.y, radius: 22 });
    }
    const player = point(state.player);
    if (state.selectedId && state.zoom >= GLOBE_START) {
      const target = LOCATIONS.find((place) => place.id === state.selectedId);
      const p = point(target.entry);
      const rightEdge = state.locationsOpen ? 740 : 912;
      if (p.x < 75 || p.x > rightEdge || p.y < 95 || p.y > 440) {
        const angle = Math.atan2(p.y - player.y, p.x - player.x);
        const arrowX = clamp(p.x, 95, rightEdge - 6);
        const arrowY = clamp(p.y, arrowX > 750 ? 146 : 107, 422);
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);
        ctx.fillStyle = "#efce8b";
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-5, -5);
        ctx.lineTo(-5, 5);
        ctx.fill();
        ctx.restore();
      }
    }
    if (state.zoom > 0.45)
      drawCharacter(player.x, player.y, time, state.moving, state.direction);
    else {
      ctx.fillStyle = "#f6ce88";
      ctx.fillRect(player.x - 3, player.y - 3, 6, 6);
    }
    ctx.restore();
  }
  function bakeSphere(longitude, latitude) {
    if (
      Math.abs(cachedLon - longitude) < 0.001 &&
      Math.abs(cachedLat - latitude) < 0.001
    )
      return;
    cachedLon = longitude;
    cachedLat = latitude;
    const sinLat = Math.sin(latitude),
      cosLat = Math.cos(latitude);
    const data = sphereImage.data;
    for (const { offset, nx, ny, z, light, rim } of samples) {
      const worldY = ny * cosLat + z * sinLat;
      const worldZ = z * cosLat - ny * sinLat;
      const lon = Math.atan2(nx, worldZ) + longitude;
      const lat = Math.asin(clamp(worldY, -1, 1));
      const u = (((lon / (Math.PI * 2) + 0.5) % 1) + 1) % 1;
      const px = Math.floor(u * terrain.textureWidth);
      const py = clamp(
        Math.floor((0.5 - lat / Math.PI) * terrain.textureHeight),
        0,
        terrain.textureHeight - 1,
      );
      const source = (py * terrain.textureWidth + px) * 4;
      data[offset] = terrain.pixels[source] * light * (1 - rim) + 89 * rim;
      data[offset + 1] =
        terrain.pixels[source + 1] * light * (1 - rim) + 183 * rim;
      data[offset + 2] =
        terrain.pixels[source + 2] * light * (1 - rim) + 204 * rim;
      data[offset + 3] = 255;
    }
    sphereCtx.putImageData(sphereImage, 0, 0);
  }

