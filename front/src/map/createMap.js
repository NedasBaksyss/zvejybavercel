import {
  WORLD,
  VIEW,
  LOCAL_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  INTERACTION_DISTANCE,
  MAP_VERSION,
  WALK_SPEED,
  RUN_SPEED,
  GLOBE_START,
  GLOBE_SWITCH,
  LOCATIONS,
  clamp,
  mix,
  distanceTo,
  nearestLocation,
  followCamera,
} from "./mapData.js";
import { createMapRenderer } from "./mapRenderer.js";
import { createMapSnapshot, createMapState } from "./mapState.js";

export function createMap({
  canvas,
  getLanguage,
  getSlot,
  emit,
  onPause,
  onChange,
  onFocus,
}) {
  const controller = new AbortController();
  const keys = new Set();
  const language = () => (getLanguage() === "LT" ? "LT" : "EN");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let renderer = null,
    active = false,
    stopped = false,
    frameId = 0,
    lastTime = 0;
  let drag = null,
    snapshot = null,
    lastPublishTime = 0;
  const panelPreference = "zvejyba.map.locationsOpen";
  let locationsOpen = false;
  try {
    locationsOpen = localStorage.getItem(panelPreference) === "true";
  } catch {}
  let state = createMapState();
  let fishing = { cast: false, startedAt: 0, target: null };
  const isGlobe = () => state.targetZoom < GLOBE_SWITCH;
  const on = (element, event, fn, options = {}) =>
    element.addEventListener(event, fn, {
      ...options,
      signal: controller.signal,
    });
  function clearInput() {
    keys.clear();
    state.moving = false;
    if (drag && canvas.hasPointerCapture(drag.id))
      canvas.releasePointerCapture(drag.id);
    drag = null;
  }
  function save() {
    const slot = getSlot();
    if (slot)
      slot.map = {
        mapId: "main_map",
        version: MAP_VERSION,
        position: { ...state.player },
        selectedId: state.selectedId,
        locationId: state.destination?.id || null,
      };
  }
  function setLocationsOpen(open, focusToggle = false) {
    if (!active || stopped) return;
    locationsOpen = open;
    clearInput();
    try {
      localStorage.setItem(panelPreference, String(open));
    } catch {}
    publish(true);
    if (focusToggle) onFocus("places");
  }
  function selectLocation(id) {
    if (!active || stopped) return;
    const place = LOCATIONS.find((item) => item.id === id);
    if (!place) return;
    state.selectedId = id;
    if (isGlobe() && place) {
      state.longitude = (place.x / WORLD.width) * Math.PI * 2 - Math.PI;
      state.latitude = Math.PI / 2 - (place.y / WORLD.height) * Math.PI;
    }
    publish(true);
  }
  function setZoom(value) {
    if (state.destination || !active) return;
    clearInput();
    state.targetZoom = clamp(value, MIN_ZOOM, MAX_ZOOM);
    if (reducedMotion.matches) state.zoom = state.targetZoom;
    if (state.targetZoom >= GLOBE_SWITCH && state.zoom < GLOBE_SWITCH)
      state.camera = { ...state.player };
    publish(true);
  }
  function showLocal() {
    if (!active || stopped) return;
    if (state.destination) leaveLocation();
    state.camera = { ...state.player };
    setZoom(LOCAL_ZOOM);
    onFocus("canvas");
  }
  function showGlobe() {
    if (!active || stopped) return;
    if (state.destination) leaveLocation();
    setZoom(MIN_ZOOM);
    onFocus("canvas");
  }
  function enterLocation(id) {
    if (!active || state.destination || state.zoom < GLOBE_START || isGlobe())
      return false;
    const place = LOCATIONS.find((item) => item.id === id);
    if (!place) return false;
    state.selectedId = place.id;
    if (distanceTo(state.player, place) > INTERACTION_DISTANCE) {
      publish(true);
      return false;
    }
    clearInput();
    state.player = { ...place.entry };
    state.destination = place;
    fishing = { cast: false, startedAt: 0, target: null };
    save();
    publish(true);
    emit("enterLocation", {
      id: place.id,
      mapId: "main_map",
      mapVersion: MAP_VERSION,
      type: place.type,
      name: place.name[language()],
      position: { ...place.entry },
      possibleFish: [...place.possibleFish],
      slot: getSlot(),
    });
    onFocus(place.type === "lake" ? "canvas" : "return");
    return true;
  }
  function toggleFishing(target = null) {
    if (!active || !state.destination || state.destination.type !== "lake")
      return false;
    const cast = !fishing.cast;
    fishing = {
      cast,
      startedAt: performance.now() / 1000,
      target: target || fishing.target,
    };
    publish(true);
    emit(fishing.cast ? "castLine" : "reelLine", {
      id: state.destination.id,
      slot: getSlot(),
    });
    return true;
  }
  function interact(id) {
    const selected = LOCATIONS.find((place) => place.id === state.selectedId);
    const nearest = nearestLocation(state.player);
    return enterLocation(
      id ||
        (selected && distanceTo(state.player, selected) <= INTERACTION_DISTANCE
          ? selected.id
          : nearest.id),
    );
  }
  function leaveLocation() {
    if (!active || stopped || !state.destination) return false;
    const locationId = state.destination.id;
    state.destination = null;
    fishing = { cast: false, startedAt: 0, target: null };
    state.camera = { ...state.player };
    clearInput();
    save();
    publish(true);
    emit("leaveLocation", {
      id: locationId,
      mapId: "main_map",
      slot: getSlot(),
    });
    onFocus("canvas");
    return true;
  }
  function applyLanguage() {
    publish(true);
  }
  function publish(force = false) {
    if (stopped) return;
    const next = createMapSnapshot(state, {
      language: language(),
      active,
      locationsOpen,
      fishingCast: fishing.cast,
    });
    if (
      !force &&
      snapshot &&
      Object.keys(next).every((key) => next[key] === snapshot[key])
    )
      return;
    snapshot = next;
    onChange(next);
  }
  function keydown(event) {
    if (!active || event.ctrlKey || event.metaKey || event.altKey) return;
    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName) ||
      event.target.isContentEditable
    )
      return;
    const key = event.code;
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
      if (state.destination || isGlobe() || state.zoom < GLOBE_START) return;
      event.preventDefault();
      keys.add(key);
    } else if (["ShiftLeft", "ShiftRight"].includes(key)) {
      keys.add(key);
    } else if (key === "KeyL" && !event.repeat && !state.destination) {
      event.preventDefault();
      setLocationsOpen(!locationsOpen);
    } else if (
      (key === "KeyE" || key === "Space") &&
      !event.repeat &&
      state.destination
    ) {
      event.preventDefault();
      toggleFishing();
    } else if (key === "KeyE" && !event.repeat) {
      event.preventDefault();
      interact();
    } else if (["Equal", "NumpadAdd"].includes(key)) {
      event.preventDefault();
      setZoom(state.targetZoom * 1.25);
    } else if (["Minus", "NumpadSubtract"].includes(key)) {
      event.preventDefault();
      setZoom(state.targetZoom / 1.25);
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
  on(document, "visibilitychange", () => {
    if (document.hidden) clearInput();
  });
  on(
    canvas,
    "wheel",
    (event) => {
      if (!active || state.destination || event.ctrlKey || event.metaKey)
        return;
      event.preventDefault();
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? VIEW.height : 1);
      setZoom(state.targetZoom * Math.exp(-clamp(delta, -300, 300) * 0.0025));
    },
    { passive: false },
  );
  on(canvas, "contextmenu", (event) => {
    if (!active) return;
    event.preventDefault();
    if (isGlobe() || state.destination) return;
    const p = point(event);
    interact(renderer?.hitTest(p.x, p.y));
  });
  on(canvas, "pointerdown", (event) => {
    if (!active || state.destination || event.button !== 0) return;
    onFocus("canvas");
    const p = point(event);
    drag = { ...p, id: event.pointerId, moved: false };
    canvas.setPointerCapture(event.pointerId);
  });
  on(canvas, "pointermove", (event) => {
    if (!drag || !active) return;
    const p = point(event),
      dx = p.x - drag.x,
      dy = p.y - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    if (isGlobe()) {
      state.longitude -= dx * 0.007;
      state.latitude = clamp(state.latitude + dy * 0.007, -1.3, 1.3);
    }
    drag.x = p.x;
    drag.y = p.y;
  });
  on(canvas, "pointerup", (event) => {
    if (!drag) return;
    if (!drag.moved) {
      const p = point(event);
      const id = renderer?.hitTest(p.x, p.y);
      if (id) selectLocation(id);
    }
    clearInput();
  });
  on(canvas, "pointercancel", clearInput);
  on(canvas, "lostpointercapture", () => {
    drag = null;
  });
  on(canvas, "click", (event) => {
    if (!active || !state.destination || state.destination.type !== "lake")
      return;
    const target = point(event);
    if (renderer?.canCastAt(target.x, target.y)) toggleFishing(target);
  });
  function frame(now) {
    if (!active || stopped) return;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    state.zoom = mix(
      state.zoom,
      state.targetZoom,
      reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 6),
    );
    if (Math.abs(state.zoom - state.targetZoom) < 0.001)
      state.zoom = state.targetZoom;
    state.moving = false;
    if (!state.destination && state.zoom >= GLOBE_START && !isGlobe()) {
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
        const next = renderer.terrain.clampPosition({
          x: state.player.x + dx * dt * speed,
          y: state.player.y + dy * dt * speed,
        });
        const before = { ...state.player };
        if (renderer.terrain.canWalk(next.x, state.player.y))
          state.player.x = next.x;
        if (renderer.terrain.canWalk(state.player.x, next.y))
          state.player.y = next.y;
        state.moving =
          before.x !== state.player.x || before.y !== state.player.y;
        save();
      }
      state.camera = followCamera(state.camera, state.player, state.zoom);
    }
    renderer.draw(
      { ...state, fishing, locationsOpen },
      reducedMotion.matches ? 0 : now / 1000,
    );
    if (now - lastPublishTime > 100) {
      publish();
      lastPublishTime = now;
    }
    frameId = requestAnimationFrame(frame);
  }
  return {
    applyLanguage,
    showLocal,
    showGlobe,
    selectLocation,
    enterLocation,
    leaveLocation,
    toggleFishing,
    zoomIn: () => setZoom(state.targetZoom * 1.3),
    zoomOut: () => setZoom(state.targetZoom / 1.3),
    toggleLocations: () => setLocationsOpen(!locationsOpen),
    closeLocations: () => setLocationsOpen(false, true),
    pause() {
      if (active && !stopped) onPause();
    },
    reset() {
      if (stopped) return;
      clearInput();
      state = createMapState();
      fishing = { cast: false, startedAt: 0, target: null };
      save();
      publish(true);
    },
    enter() {
      if (stopped || active) return;
      renderer ||= createMapRenderer(canvas, language);
      active = true;
      clearInput();
      applyLanguage();
      lastTime = performance.now();
      frameId = requestAnimationFrame(frame);
      onFocus(
        state.destination && state.destination.type !== "lake"
          ? "return"
          : "canvas",
      );
    },
    exit() {
      active = false;
      cancelAnimationFrame(frameId);
      clearInput();
      save();
      publish();
    },
    back() {
      if (!active || stopped) return false;
      if (leaveLocation()) return true;
      if (locationsOpen) {
        setLocationsOpen(false, true);
        return true;
      }
      return false;
    },
    getState: () => ({
      ...state,
      locationsOpen,
      player: { ...state.player },
      camera: { ...state.camera },
      fishing: {
        ...fishing,
        target: fishing.target ? { ...fishing.target } : null,
      },
    }),
    stop() {
      if (stopped) return;
      stopped = true;
      this.exit();
      controller.abort();
      renderer?.terrain.dispose();
    },
  };
}
