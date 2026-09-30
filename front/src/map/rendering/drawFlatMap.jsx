import { WORLD, VIEW, LOCATIONS, GLOBE_START, clamp, mix } from "../mapData.js";
import { label, drawCharacter, drawPlayerName } from "./mapSprites.jsx";

export function drawFlatMap(
  ctx,
  terrain,
  state,
  time,
  blend,
  getLanguage,
  markerHits,
) {
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
        ctx,
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
  if (state.zoom > 0.45) {
    drawCharacter(ctx, player.x, player.y, time, state.moving, state.direction);
    drawPlayerName(ctx, state.playerName, player.x, player.y);
  } else {
    ctx.fillStyle = "#f6ce88";
    ctx.fillRect(player.x - 3, player.y - 3, 6, 6);
  }
  ctx.restore();
}
