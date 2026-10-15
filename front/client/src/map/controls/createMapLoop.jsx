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
  buildFishingPresence,
  publishFishingState,
}) {
  let frameId = 0;
  let lastTime = 0;
  let lastPublishTime = 0;
  let lastNetworkUpdate = 0;

  let wasMoving = false;
  let lastFishingPhase = null;

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
    const movementChanged = runtime.state.moving !== wasMoving;

    if (
      movementRequested &&
      runtime.state.moving &&
      now - lastNetworkUpdate >= 50
    ) {
      socket.emit("player:move", {
        x: runtime.state.player.x,
        y: runtime.state.player.y,
        moving: true,
        direction: runtime.state.direction,
      });

      lastNetworkUpdate = now;
    } else if (movementChanged && !runtime.state.moving) {
      // Tell other players that we stopped.
      socket.emit("player:move", {
        x: runtime.state.player.x,
        y: runtime.state.player.y,
        moving: false,
        direction: runtime.state.direction,
      });

      lastNetworkUpdate = now;
    }

    wasMoving = runtime.state.moving;

    const previousPhase = runtime.fishing.phase;

    const outcome = updateFishing(
      runtime.fishing,
      dt,
      runtime.state.destination?.possibleFish || [],
    );

    const phaseChanged = runtime.fishing.phase !== previousPhase;

    if (phaseChanged) {
      lastFishingPhase = runtime.fishing.phase;

      if (["bite", "fighting"].includes(runtime.fishing.phase)) {
        publishFishingState({
          ...buildFishingPresence(true),
          active: true,
          phase: runtime.fishing.phase,
        });
      }
    }

    if (phaseChanged) {
      lastFishingPhase = runtime.fishing.phase;

      if (
        runtime.fishing.phase === "bite" ||
        runtime.fishing.phase === "fighting"
      ) {
        publishFishingState({
          ...buildFishingPresence(true),
          phase: runtime.fishing.phase,
          active: true,
          target: runtime.fishing.target,
        });
      }
    }

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

      publishFishingState({
        ...buildFishingPresence(false),
        active: false,
        target: null,
        phase: "caught",
      });
    } else if (outcome === "lost") {
      emit("fishLost", {
        id: runtime.state.destination?.id,
        slot: getSlot(),
      });

      publishFishingState({
        ...buildFishingPresence(false),
        active: false,
        target: null,
        phase: "lost",
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
      now / 1000,
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
      wasMoving = false;

      frameId = requestAnimationFrame(frame);
    },

    stop() {
      cancelAnimationFrame(frameId);
      frameId = 0;
    },
  };
}
