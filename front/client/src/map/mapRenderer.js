import { VIEW, MAP_TEXT, GLOBE_START, GLOBE_END, smooth } from "./mapData.js";
import { createTerrain } from "./mapTerrain.js";
import { drawFlatMap } from "./rendering/drawFlatMap.jsx";
import { createGlobeRenderer } from "./rendering/createGlobeRenderer.jsx";
import { drawDestination } from "./rendering/drawDestination.jsx";
import { canCastAt } from "./rendering/drawFishingScene.js";

export function createMapRenderer(canvas, getLanguage, remotePlayers) {
  const ctx = canvas.getContext("2d");
  const terrain = createTerrain();
  const globe = createGlobeRenderer(ctx, terrain, getLanguage);
  const text = () => MAP_TEXT[getLanguage()] || MAP_TEXT.EN;
  let markerHits = [];
  return {
    terrain,
    canCastAt,
    dispose() {
      terrain.dispose();
      globe.dispose();
      markerHits = [];
    },
    hitTest(x, y) {
      return markerHits
        .filter((pin) => Math.hypot(pin.x - x, pin.y - y) < pin.radius)
        .sort(
          (a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y),
        )[0]?.id;
    },
    draw(state, time) {
      markerHits = [];
      ctx.clearRect(0, 0, VIEW.width, VIEW.height);
      ctx.imageSmoothingEnabled = false;
      if (state.destination) {
        drawDestination(ctx, state.destination, time, state, remotePlayers);
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
      if (blend < 1)
        drawFlatMap(ctx, terrain, state, time, blend, getLanguage, markerHits, remotePlayers);
      if (blend > 0) globe.draw(state, blend, markerHits);
      if (blend > 0.98) {
        ctx.font = "11px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#8daaa1";
        ctx.fillText(text().globeNote, globe.center.x, 509);
      }
    },
  };
}
