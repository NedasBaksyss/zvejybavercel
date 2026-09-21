import { updateMapMovement } from "./updateMapMovement.jsx";

export function createMapLoop({ runtime, keys, save, publish }) {
  let frameId = 0;
  let lastTime = 0;
  let lastPublishTime = 0;

  function frame(now) {
    if (!runtime.active || runtime.stopped) return;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    if (
      updateMapMovement(
        runtime.state,
        keys,
        runtime.renderer.terrain,
        dt,
        runtime.reducedMotion.matches,
      )
    )
      save();
    runtime.renderer.draw(
      {
        ...runtime.state,
        fishing: runtime.fishing,
        locationsOpen: runtime.locationsOpen,
      },
      runtime.reducedMotion.matches ? 0 : now / 1000,
    );
    if (now - lastPublishTime > 100) {
      publish();
      lastPublishTime = now;
    }
    frameId = requestAnimationFrame(frame);
  }

  return {
    start() {
      cancelAnimationFrame(frameId);
      lastTime = performance.now();
      frameId = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(frameId);
      frameId = 0;
    },
  };
}
