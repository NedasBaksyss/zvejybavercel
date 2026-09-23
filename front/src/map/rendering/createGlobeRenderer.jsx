import { WORLD, LOCATIONS, clamp, mix, globePoint } from "../mapData.js";
import { label } from "./mapSprites.jsx";

export function createGlobeRenderer(ctx, terrain, getLanguage) {
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

  const center = { x: 392, y: 294 };
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

  function drawGlobe(state, blend, markerHits) {
    center.x = state.locationsOpen ? 392 : 480;
    const radius = mix(248, 204, blend);
    bakeSphere(state.longitude, state.latitude);
    ctx.save();
    ctx.globalAlpha = blend;
    const atmosphere = ctx.createRadialGradient(
      center.x,
      center.y,
      radius - 5,
      center.x,
      center.y,
      radius + 20,
    );
    atmosphere.addColorStop(0, "#74c3d4a0");
    atmosphere.addColorStop(0.5, "#3c9eb537");
    atmosphere.addColorStop(1, "#25617900");
    ctx.fillStyle = atmosphere;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius + 20, 0, 7);
    ctx.fill();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      sphere,
      center.x - radius,
      center.y - radius,
      radius * 2,
      radius * 2,
    );
    ctx.strokeStyle = "#9ebf9950";
    ctx.lineWidth = 1;
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      let previous = false;
      for (let lon = -180; lon <= 180; lon += 3) {
        const p = globePoint(
          {
            x: ((lon + 180) / 360) * WORLD.width,
            y: ((90 - lat) / 180) * WORLD.height,
          },
          state.longitude,
          state.latitude,
          radius,
          center,
        );
        if (p.visible) {
          if (previous) ctx.lineTo(p.x, p.y);
          else ctx.moveTo(p.x, p.y);
        }
        previous = p.visible;
      }
      ctx.stroke();
    }
    for (let lon = -180; lon < 180; lon += 30) {
      ctx.beginPath();
      let previous = false;
      for (let lat = -90; lat <= 90; lat += 3) {
        const p = globePoint(
          {
            x: ((lon + 180) / 360) * WORLD.width,
            y: ((90 - lat) / 180) * WORLD.height,
          },
          state.longitude,
          state.latitude,
          radius,
          center,
        );
        if (p.visible) {
          if (previous) ctx.lineTo(p.x, p.y);
          else ctx.moveTo(p.x, p.y);
        }
        previous = p.visible;
      }
      ctx.stroke();
    }
    for (const place of LOCATIONS) {
      const p = globePoint(
        place,
        state.longitude,
        state.latitude,
        radius,
        center,
      );
      if (!p.visible) continue;
      const selected = state.selectedId === place.id;
      ctx.shadowColor = place.type === "shop" ? "#f1bc78" : "#8edbd0";
      ctx.shadowBlur = selected ? 14 : 6;
      ctx.fillStyle = selected
        ? "#ffe0a0"
        : place.type === "shop"
          ? "#eab881"
          : "#9cdcca";
      ctx.fillRect(Math.round(p.x) - 3, Math.round(p.y) - 3, 6, 6);
      ctx.shadowBlur = 0;
      if (selected)
        label(ctx, place.name[getLanguage()], p.x, p.y - 32, "#f2dca9", true);
      if (blend > 0.6)
        markerHits.push({ id: place.id, x: p.x, y: p.y, radius: 12 });
    }
    const player = globePoint(
      state.player,
      state.longitude,
      state.latitude,
      radius,
      center,
    );
    if (player.visible) {
      ctx.strokeStyle = "#ffdf94";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 7, 0, 7);
      ctx.stroke();
    }
    ctx.restore();
  }
  return {
    draw: drawGlobe,
    center,
    dispose() {
      sphere.width = sphere.height = 1;
      samples.length = 0;
    },
  };
}
