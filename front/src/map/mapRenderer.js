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
  function drawGlobe(state, blend) {
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
        label(place.name[getLanguage()], p.x, p.y - 32, "#f2dca9", true);
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

  function drawFishingScene(time, cast) {
    const waterTop = 282;
    const bobberX = 548 + Math.sin(time * 0.7) * 7;
    const bobberY = 386 + Math.sin(time * 1.8) * 2;
    const lineX = cast ? bobberX : 454;
    const lineY = cast ? bobberY : 230;
    const sky = ctx.createLinearGradient(0, 0, 0, waterTop);
    sky.addColorStop(0, "#173346");
    sky.addColorStop(1, "#a9b8a1");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW.width, waterTop);
    ctx.fillStyle = "#557c75";
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 170 - 100, 282);
      ctx.lineTo(i * 170 + 8, 165 + (i % 3) * 22);
      ctx.lineTo(i * 170 + 150, 282);
      ctx.fill();
    }
    ctx.fillStyle = "#31583f";
    ctx.fillRect(0, 268, VIEW.width, 22);
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = i % 2 ? "#234d3b" : "#376847";
      ctx.fillRect(i * 29, 252 - (i % 4) * 5, 5, 25);
      ctx.fillRect(i * 29 - 5, 259 - (i % 4) * 5, 15, 3);
    }
    const water = ctx.createLinearGradient(0, waterTop, 0, VIEW.height);
    water.addColorStop(0, "#629b9c");
    water.addColorStop(1, "#163f57");
    ctx.fillStyle = water;
    ctx.fillRect(0, waterTop, VIEW.width, VIEW.height - waterTop);
    for (let i = 0; i < 60; i++) {
      const y = 300 + ((i * 31) % 220);
      ctx.fillStyle = i % 3 ? "#b0d6c442" : "#87b9b75e";
      ctx.fillRect(
        (i * 137 + Math.sin(time * 0.7 + i) * 8) % VIEW.width,
        y,
        12 + (i % 6) * 5,
        2,
      );
    }
    ctx.fillStyle = "#344c37";
    ctx.beginPath();
    ctx.moveTo(0, 440);
    ctx.lineTo(170, 400);
    ctx.lineTo(325, 443);
    ctx.lineTo(485, VIEW.height);
    ctx.lineTo(0, VIEW.height);
    ctx.fill();
    for (let i = 0; i < 18; i++) drawTree(ctx, i * 22 - 18, 458 + (i % 3) * 10, 2.6);
    ctx.fillStyle = "#9e865e";
    ctx.fillRect(155, 410, 300, 17);
    ctx.fillRect(185, 427, 9, 70);
    ctx.fillRect(412, 427, 9, 70);
    ctx.fillStyle = "#67583e";
    for (let x = 162; x < 450; x += 16) ctx.fillRect(x, 410, 2, 17);
    drawCharacter(385, 405, time, false, "right");
    ctx.strokeStyle = "#2a1f2c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(409, 384);
    ctx.lineTo(lineX, lineY);
    ctx.stroke();
    ctx.strokeStyle = "#d2e1d3aa";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(418, 173);
    ctx.quadraticCurveTo(470, 245, lineX, lineY);
    ctx.stroke();
    if (cast) {
      const ripple = (time * 18) % 38;
      ctx.strokeStyle = "#c5e5d780";
      ctx.beginPath();
      ctx.ellipse(bobberX, bobberY + 4, 12 + ripple, 4 + ripple * 0.22, 0, 0, 7);
      ctx.stroke();
      ctx.fillStyle = "#d4574e";
      ctx.fillRect(bobberX - 2, bobberY - 6, 4, 10);
      ctx.fillStyle = "#ffdca8";
      ctx.fillRect(bobberX - 2, bobberY - 8, 4, 3);
    }
    ctx.fillStyle = "#d8b97e";
    ctx.fillRect(35, 44, 3, 3);
    ctx.fillRect(48, 72, 2, 2);
    ctx.fillRect(815, 58, 3, 3);
  }

  function drawDestination(location, time, state) {
    if (location.type === "lake") {
      drawFishingScene(time, state.fishing?.cast);
      return;
    }
    const sky = ctx.createLinearGradient(0, 0, 0, 320);
    sky.addColorStop(0, "#173346");
    sky.addColorStop(1, "#a9b8a1");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = "#dad9aa";
    ctx.fillRect(153, 113, 42, 40);
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = i % 2 ? "#4d736b" : "#608780";
      ctx.beginPath();
      ctx.moveTo(i * 140 - 90, 279);
      ctx.lineTo(i * 140 + 10, 164 + (i % 3) * 19);
      ctx.lineTo(i * 140 + 143, 280);
      ctx.fill();
    }
    ctx.fillStyle = "#466644";
    ctx.fillRect(0, 246, VIEW.width, VIEW.height);
    for (let i = 0; i < 66; i++)
      drawTree(ctx, i * 16, 273 + Math.sin(i * 2) * 9, 1.4 + (i % 4) * 0.25);
    if (location.type === "shop") {
      ctx.fillStyle = "#84956a";
      ctx.fillRect(0, 300, 960, 240);
      ctx.fillStyle = "#c1b183";
      ctx.beginPath();
      ctx.moveTo(250, 375);
      ctx.lineTo(340, 375);
      ctx.lineTo(485, 540);
      ctx.lineTo(155, 540);
      ctx.fill();
      drawShop(ctx, 291, 339, 5.4);
      for (let i = 0; i < 7; i++)
        drawTree(ctx, 46 + i * 74, 430 + Math.sin(i) * 55, 2.2);
      drawCharacter(313, 454, time, false, "up");
    } else {
      const water = ctx.createLinearGradient(0, 281, 0, 540);
      water.addColorStop(0, "#629b9c");
      water.addColorStop(1, "#163f57");
      ctx.fillStyle = water;
      ctx.fillRect(0, 282, 960, 258);
      if (location.type === "river") {
        ctx.fillStyle = "#648558";
        ctx.beginPath();
        ctx.moveTo(0, 280);
        ctx.lineTo(200, 285);
        ctx.lineTo(420, 540);
        ctx.lineTo(0, 540);
        ctx.fill();
      }
      if (location.type === "waterfall") {
        ctx.fillStyle = "#5c7972";
        ctx.fillRect(164, 227, 184, 88);
        ctx.fillStyle = "#b5e2d6";
        ctx.fillRect(214, 224, 54, 131);
        ctx.fillStyle = "#e0efce";
        for (let i = 0; i < 7; i++)
          ctx.fillRect(218 + i * 7, 230 + Math.sin(time * 2 + i) * 4, 3, 119);
        ctx.fillStyle = "#c5e5d780";
        ctx.beginPath();
        ctx.ellipse(241, 359, 68, 12, 0, 0, 7);
        ctx.fill();
      }
      for (let i = 0; i < 85; i++) {
        ctx.fillStyle = i % 3 ? "#b0d6c442" : "#87b9b75e";
        ctx.fillRect(
          (i * 113 + Math.sin(time + i) * 6) % 960,
          296 + ((i * 19) % 230),
          12 + (i % 7) * 4,
          2,
        );
      }
      ctx.fillStyle = "#344c37";
      ctx.beginPath();
      ctx.moveTo(0, 440);
      ctx.lineTo(77, 410);
      ctx.lineTo(162, 449);
      ctx.lineTo(290, 540);
      ctx.lineTo(0, 540);
      ctx.fill();
      ctx.fillStyle = "#9e865e";
      ctx.fillRect(98, 416, 228, 16);
      ctx.fillRect(130, 432, 8, 48);
      ctx.fillRect(302, 432, 8, 45);
      ctx.fillStyle = "#67583e";
      for (let x = 105; x < 326; x += 13) ctx.fillRect(x, 416, 2, 16);
      drawCharacter(275, 406, time, false, "right");
      for (let i = 0; i < 10; i++)
        drawTree(ctx, i * 15 - 15, 462 + (i % 3) * 10, 2.8);
    }
  }

  return {
    terrain,
    hitTest(x, y) {
      return markerHits
        .filter((pin) => Math.hypot(pin.x - x, pin.y - y) < pin.radius)
        .sort(
          (a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y),
        )[0]?.id;
    },
    draw(state, time) {
      center.x = state.locationsOpen ? 392 : 480;
      markerHits = [];
      ctx.clearRect(0, 0, VIEW.width, VIEW.height);
      ctx.imageSmoothingEnabled = false;
      if (state.destination) {
        drawDestination(state.destination, time, state);
        return;
      }
      ctx.fillStyle = "#091922";
      ctx.fillRect(0, 0, VIEW.width, VIEW.height);
      for (let i = 0; i < 92; i++) {
        ctx.fillStyle = i % 3 ? "#345765" : "#89afb3";
        ctx.fillRect(
          (i * 197 + 53) % VIEW.width,
          (i * 71 + 89) % VIEW.height,
          i % 5 === 0 ? 2 : 1,
          1,
        );
      }
      const blend = smooth(
        (GLOBE_START - state.zoom) / (GLOBE_START - GLOBE_END),
      );
      if (blend < 1) drawFlat(state, time, blend);
      if (blend > 0) drawGlobe(state, blend);
      if (blend > 0.98) {
        ctx.font = "11px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#8daaa1";
        ctx.fillText(text().globeNote, center.x, 509);
      }
    },
  };
}
