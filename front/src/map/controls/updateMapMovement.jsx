import {
  GLOBE_START,
  GLOBE_SWITCH,
  WALK_SPEED,
  RUN_SPEED,
  mix,
  followCamera,
} from "../mapData.js";

export function updateMapMovement(state, keys, terrain, dt, reducedMotion) {
  let movementRequested = false;
  state.zoom = mix(
    state.zoom,
    state.targetZoom,
    reducedMotion ? 1 : 1 - Math.exp(-dt * 6),
  );
  if (Math.abs(state.zoom - state.targetZoom) < 0.001)
    state.zoom = state.targetZoom;
  state.moving = false;
  if (
    !state.destination &&
    state.zoom >= GLOBE_START &&
    state.targetZoom >= GLOBE_SWITCH
  ) {
    let dx =
      Number(keys.has("KeyD") || keys.has("ArrowRight")) -
      Number(keys.has("KeyA") || keys.has("ArrowLeft"));
    let dy =
      Number(keys.has("KeyS") || keys.has("ArrowDown")) -
      Number(keys.has("KeyW") || keys.has("ArrowUp"));
    const length = Math.hypot(dx, dy);
    if (length) {
      dx /= length;
      dy /= length;
      state.direction =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0
            ? "right"
            : "left"
          : dy > 0
            ? "down"
            : "up";
      const speed =
        keys.has("ShiftLeft") || keys.has("ShiftRight")
          ? RUN_SPEED
          : WALK_SPEED;
      const next = terrain.clampPosition({
        x: state.player.x + dx * dt * speed,
        y: state.player.y + dy * dt * speed,
      });
      const before = { ...state.player };
      if (terrain.canWalk(next.x, state.player.y)) state.player.x = next.x;
      if (terrain.canWalk(state.player.x, next.y)) state.player.y = next.y;
      state.moving = before.x !== state.player.x || before.y !== state.player.y;
      movementRequested = true;
    }
    state.camera = followCamera(state.camera, state.player, state.zoom);
  }

  return movementRequested;
}
