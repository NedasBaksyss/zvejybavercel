import { updateMapMovement } from "./updateMapMovement.jsx";
import { updateFishing } from "../fishing.js";

export function createMapLoop({
  runtime,
  keys,
  save,
  publish,
  getSlot,
  emit,
  socket,
}) {
  let frameId = 0;
  let lastTime = 0;
  let lastPublishTime = 0;
  let lastNetworkUpdate = 0;

  function frame(now) {
    if (!runtime.active || runtime.stopped) return;

    const dt =
      document.hidden || !document.hasFocus()
        ? 0
        : Math.min((now - lastTime) / 1000, 0.05);

    lastTime = now;

    /*
     * Update local movement every frame.
     *
     * The terrain belongs to the renderer, so get it from there.
     */
    const movementRequested = updateMapMovement(
      runtime.state,
      keys,
      runtime.renderer.terrain,
      dt,
      runtime.reducedMotion.matches,
    );

    /*
     * Send our position to the server when we actually move.
     *
     * 50ms = roughly 20 network updates per second.
     */
    if (
      movementRequested &&
      runtime.state.moving &&
      now - lastNetworkUpdate >= 50
    ) {
      socket.emit("player:move", {
        x: runtime.state.player.x,
        y: runtime.state.player.y,
        moving: runtime.state.moving,
        direction: runtime.state.direction,
      });

      lastNetworkUpdate = now;
    }

    const outcome = updateFishing(
      runtime.fishing,
      dt,
      runtime.state.destination?.possibleFish || [],
    );

    if (outcome === "caught") {
      const slot = getSlot();

      const catchData = {
        fish: runtime.fishing.fish,
        locationId: runtime.state.destination.id,
        at: Date.now(),
      };

      if (slot) {
        slot.catches = [...(slot.catches || []), catchData];
      }

      emit("fishCaught", {
        ...catchData,
        slot,
      });
    } else if (outcome === "lost") {
      emit("fishLost", {
        id: runtime.state.destination?.id,
        slot: getSlot(),
      });
    }

    save();

    runtime.renderer.draw(
      {
        ...runtime.state,
        playerName:
          runtime.progress?.profile?.username ||
          getSlot()?.owner ||
          "Guest",
        fishing: runtime.fishing,
        locationsOpen: runtime.locationsOpen,
      },
      runtime.reducedMotion.matches ? 0 : now / 1000,
    );

    if (
      outcome ||
      now - lastPublishTime >
        (runtime.fishing.phase === "fighting" ? 33 : 100)
    ) {
      publish();
      lastPublishTime = now;
    }

    frameId = requestAnimationFrame(frame);
  }

  return {
    start() {
      cancelAnimationFrame(frameId);

      lastTime = performance.now();
      lastNetworkUpdate = 0;

      frameId = requestAnimationFrame(frame);
    },

    stop() {
      cancelAnimationFrame(frameId);
      frameId = 0;
    },
  };
}
