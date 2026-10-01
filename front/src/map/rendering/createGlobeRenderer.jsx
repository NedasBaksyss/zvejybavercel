import { WORLD, LOCATIONS, clamp, mix, globePoint } from "../mapData.js";
import { label } from "./mapSprites.jsx";

export function createGlobeRenderer(ctx, terrain, getLanguage) {
  const sphere = document.createElement("canvas");
  const size = 512;
  const half = size / 2;
  const sphereRadius = half - 1;
  sphere.width = sphere.height = size;
  const sphereCtx = sphere.getContext("2d");
  const sphereImage = sphereCtx.createImageData(size, size);
  const samples = [];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5 - half) / sphereRadius,
        ny = (half - y - 0.5) / sphereRadius;
      const square = nx * nx + ny * ny;
      if (square > 1) continue;
      const z = Math.sqrt(1 - square);
      samples.push({
        offset: (y * size + x) * 4,
        alpha: Math.min(1, (1 - Math.sqrt(square)) * sphereRadius) * 255,
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
    for (const { offset, alpha, nx, ny, z, light, rim } of samples) {
      const worldY = ny * cosLat + z * sinLat;
      const worldZ = z * cosLat - ny * sinLat;
      const lon = Math.atan2(nx, worldZ) + longitude;
      const lat = Math.asin(clamp(worldY, -1, 1));
      const u = (((lon / (Math.PI * 2) + 0.5) % 1) + 1) % 1;
      // Bilinear sampling avoids hard texture pixels and shimmer during rotation.
      const width = terrain.textureWidth, height = terrain.textureHeight;
      const tx = u * width - 0.5;
      const ty = clamp((0.5 - lat / Math.PI) * height - 0.5, 0, height - 1);
      const ix = Math.floor(tx), iy = Math.floor(ty);
      const fx = tx - ix, fy = ty - iy;
      const x0 = (ix + width) % width, x1 = (x0 + 1) % width;
      const y1 = Math.min(iy + 1, height - 1);
      const topLeft = (iy * width + x0) * 4, topRight = (iy * width + x1) * 4;
      const bottomLeft = (y1 * width + x0) * 4, bottomRight = (y1 * width + x1) * 4;
      for (let channel = 0; channel < 3; channel++) {
        const top = mix(terrain.pixels[topLeft + channel], terrain.pixels[topRight + channel], fx);
        const bottom = mix(terrain.pixels[bottomLeft + channel], terrain.pixels[bottomRight + channel], fx);
        const rimColor = channel === 0 ? 89 : channel === 1 ? 183 : 204;
        data[offset + channel] = mix(top, bottom, fy) * light * (1 - rim) + rimColor * rim;
      }
      data[offset + 3] = alpha;
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
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
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
