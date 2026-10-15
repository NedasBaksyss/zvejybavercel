import { VIEW, GLOBE_START, clamp } from "../mapData.js";
import { steerFishing } from "../fishing.js";

export function createMapInput({
  canvas,
  runtime,
  keys,
  isGlobe,
  actions,
  onFocus,
}) {
  const controller = new AbortController();
  const { setLocationsOpen, toggleFishing, interact, setZoom, selectLocation } =
    actions;
  let drag = null;
  const on = (element, event, fn, options = {}) =>
    element.addEventListener(event, fn, {
      ...options,
      signal: controller.signal,
    });
  function clearInput() {
    keys.clear();
    runtime.state.moving = false;
    if (drag && canvas.hasPointerCapture(drag.id))
      canvas.releasePointerCapture(drag.id);
    drag = null;
  }

  function keydown(event) {
    if (!runtime.active || event.ctrlKey || event.metaKey || event.altKey)
      return;
    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName) ||
      event.target.isContentEditable
    )
      return;
    const key = event.code;
    if (runtime.fishing.phase === "fighting" &&
      ["KeyA", "KeyD", "ArrowLeft", "ArrowRight"].includes(key)) {
      event.preventDefault();
      if (!event.repeat) steerFishing(runtime.fishing, key);
      return;
    }
    if (key === "Space" && event.target.closest?.("button")) return;
    if (
      [
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(key)
    ) {
      if (
        runtime.state.destination ||
        isGlobe() ||
        runtime.state.zoom < GLOBE_START
      )
        return;
      event.preventDefault();
      keys.add(key);
    } else if (["ShiftLeft", "ShiftRight"].includes(key)) {
      keys.add(key);
    } else if (key === "KeyL" && !event.repeat && !runtime.state.destination) {
      event.preventDefault();
      setLocationsOpen(!runtime.locationsOpen);
    } else if (
      (key === "KeyE" || key === "Space") &&
      !event.repeat &&
      runtime.state.destination
    ) {
      event.preventDefault();
      toggleFishing();
    } else if (key === "KeyE" && !event.repeat) {
      event.preventDefault();
      interact();
    } else if (["Equal", "NumpadAdd"].includes(key)) {
      event.preventDefault();
      setZoom(runtime.state.targetZoom * 1.25);
    } else if (["Minus", "NumpadSubtract"].includes(key)) {
      event.preventDefault();
      setZoom(runtime.state.targetZoom / 1.25);
    }
  }

  function point(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * VIEW.width,
      y: ((event.clientY - bounds.top) / bounds.height) * VIEW.height,
    };
  }

  on(window, "keydown", keydown);
  on(window, "keyup", (event) => keys.delete(event.code));
  on(window, "blur", clearInput);
  on(document, "focusin", (event) => {
    if (event.target.closest?.("[data-game-chat]") || event.target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) clearInput();
  });
  on(document, "visibilitychange", () => {
    if (document.hidden) clearInput();
  });
  on(
    canvas,
    "wheel",
    (event) => {
      if (
        !runtime.active ||
        runtime.state.destination ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      event.preventDefault();
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? VIEW.height : 1);
      setZoom(
        runtime.state.targetZoom * Math.exp(-clamp(delta, -300, 300) * 0.0025),
      );
    },
    { passive: false },
  );
  on(canvas, "contextmenu", (event) => {
    if (!runtime.active) return;
    event.preventDefault();
    if (isGlobe() || runtime.state.destination) return;
    const p = point(event);
    interact(runtime.renderer?.hitTest(p.x, p.y));
  });
  on(canvas, "pointerdown", (event) => {
    if (!runtime.active || runtime.state.destination || event.button !== 0)
      return;
    onFocus("canvas");
    const p = point(event);
    drag = { ...p, id: event.pointerId, moved: false };
    canvas.setPointerCapture(event.pointerId);
  });
  on(canvas, "pointermove", (event) => {
    if (!drag || !runtime.active) return;
    const p = point(event),
      dx = p.x - drag.x,
      dy = p.y - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    if (isGlobe()) {
      runtime.state.longitude -= dx * 0.007;
      runtime.state.latitude = clamp(
        runtime.state.latitude + dy * 0.007,
        -1.3,
        1.3,
      );
    }
    drag.x = p.x;
    drag.y = p.y;
  });
  on(canvas, "pointerup", (event) => {
    if (!drag) return;
    if (!drag.moved) {
      const p = point(event);
      const id = runtime.renderer?.hitTest(p.x, p.y);
      if (id) selectLocation(id);
    }
    clearInput();
  });
  on(canvas, "pointercancel", clearInput);
  on(canvas, "lostpointercapture", () => {
    drag = null;
  });
  on(canvas, "click", (event) => {
    if (
      !runtime.active ||
      !runtime.state.destination ||
      runtime.state.destination.type !== "lake"
    )
      return;
    const target = point(event);
    if (
      runtime.fishing.phase === "bite" ||
      runtime.renderer?.canCastAt(
        target.x,
        target.y,
        runtime.state.destination.id,
      )
    )
      toggleFishing(target);
  });

  return {
    clear: clearInput,
    stop() {
      clearInput();
      controller.abort();
    },
  };
}
