import {
  WORLD,
  VIEW,
  SPAWN,
  LOCAL_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  INTERACTION_DISTANCE,
  MAP_VERSION,
  WALK_SPEED,
  RUN_SPEED,
  GLOBE_START,
  GLOBE_SWITCH,
  regionName,
  LOCATIONS,
  MAP_TEXT,
  clamp,
  mix,
  distanceTo,
  nearestLocation,
  followCamera,
} from "./mapData.js";
import { createMapRenderer } from "./mapRenderer.js";

export function createMap({ root, getLanguage, getSlot, emit, onPause }) {
  const $ = (id) => root.querySelector(`#${id}`);
  const canvas = $("map-canvas");
  const controller = new AbortController();
  const keys = new Set();
  const language = () => (getLanguage() === "LT" ? "LT" : "EN");
  const text = () => MAP_TEXT[language()];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let renderer = null,
    active = false,
    stopped = false,
    frameId = 0,
    lastTime = 0;
  let drag = null,
    hudSignature = "",
    lastHudTime = 0;
  const panelPreference = "zvejyba.map.locationsOpen";
  let locationsOpen = false;
  try {
    locationsOpen = localStorage.getItem(panelPreference) === "true";
  } catch {}
  const freshState = () => ({
    player: { ...SPAWN },
    camera: { ...SPAWN },
    zoom: LOCAL_ZOOM,
    targetZoom: LOCAL_ZOOM,
    longitude: (SPAWN.x / WORLD.width) * Math.PI * 2 - Math.PI,
    latitude: Math.PI / 2 - (SPAWN.y / WORLD.height) * Math.PI,
    moving: false,
    direction: "down",
    selectedId: "quiet-lake",
    destination: null,
  });
  let state = freshState();
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
    locationsOpen = open;
    clearInput();
    try {
      localStorage.setItem(panelPreference, String(open));
    } catch {}
    updateHud(true);
    if (focusToggle) $("map-places-toggle").focus({ preventScroll: true });
  }
  function selectLocation(id) {
    state.selectedId = id;
    const place = LOCATIONS.find((item) => item.id === id);
    if (isGlobe() && place) {
      state.longitude = (place.x / WORLD.width) * Math.PI * 2 - Math.PI;
      state.latitude = Math.PI / 2 - (place.y / WORLD.height) * Math.PI;
    }
    updateHud(true);
  }
  function setZoom(value) {
    if (state.destination || !active) return;
    clearInput();
    state.targetZoom = clamp(value, MIN_ZOOM, MAX_ZOOM);
    if (reducedMotion.matches) state.zoom = state.targetZoom;
    if (state.targetZoom >= GLOBE_SWITCH && state.zoom < GLOBE_SWITCH)
      state.camera = { ...state.player };
    updateHud(true);
  }
  function showLocal() {
    if (state.destination) leaveLocation();
    state.camera = { ...state.player };
    setZoom(LOCAL_ZOOM);
    canvas.focus({ preventScroll: true });
  }
  function showGlobe() {
    if (state.destination) leaveLocation();
    setZoom(MIN_ZOOM);
    canvas.focus({ preventScroll: true });
  }
  function enterLocation(id) {
    if (!active || state.destination || state.zoom < GLOBE_START || isGlobe())
      return false;
    const place = LOCATIONS.find((item) => item.id === id);
    if (!place) return false;
    state.selectedId = place.id;
    if (distanceTo(state.player, place) > INTERACTION_DISTANCE) {
      updateHud(true);
      return false;
    }
    clearInput();
    state.player = { ...place.entry };
    state.destination = place;
    fishing = { cast: false, startedAt: 0, target: null };
    save();
    updateHud(true);
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
    $("map-return").focus({ preventScroll: true });
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
    updateHud(true);
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
    if (!state.destination) return false;
    const locationId = state.destination.id;
    state.destination = null;
    fishing = { cast: false, startedAt: 0, target: null };
    state.camera = { ...state.player };
    clearInput();
    save();
    updateHud(true);
    emit("leaveLocation", {
      id: locationId,
      mapId: "main_map",
      slot: getSlot(),
    });
    canvas.focus({ preventScroll: true });
    return true;
  }
  function applyLanguage() {
    const L = text();
    for (const [id, value] of Object.entries({
      "map-eyebrow": L.title,
      "map-local": L.map,
      "map-globe": L.globe,
      "map-places-title": L.places,
      "map-list-hint": L.listHint,
      "map-places-toggle-label": L.placesButton,
      "map-enter": L.enter,
      "map-return": L.back,
      "map-arrived": L.arrived,
    }))
      $(id).textContent = value;
    for (const [id, value] of Object.entries({
      "map-plus": L.zoomIn,
      "map-minus": L.zoomOut,
      "map-center": L.focus,
      "map-pause": L.pause,
      "map-places-close": L.hidePlaces,
    })) {
      $(id).title = value;
      $(id).setAttribute("aria-label", value);
    }
    canvas.setAttribute("aria-label", L.canvas);
    for (const place of LOCATIONS) {
      root.querySelector(`[data-place-name="${place.id}"]`).textContent =
        place.name[language()];
      root.querySelector(`[data-place-type="${place.id}"]`).textContent =
        L[place.type];
    }
    updateHud(true);
  }
  function updateHud(force = false) {
    const L = text();
    const nearest = nearestLocation(state.player);
    const nearby =
      state.zoom >= GLOBE_START &&
      !isGlobe() &&
      distanceTo(state.player, nearest) <= INTERACTION_DISTANCE;
    const selected = LOCATIONS.find((place) => place.id === state.selectedId);
    const place = nearby ? nearest : selected || nearest;
    const distance = Math.round(distanceTo(state.player, place));
    const region = regionName(state.player, language());
    const signature = [
      language(),
      isGlobe(),
      region,
      locationsOpen,
      state.destination?.id,
      place.id,
      nearby,
      state.selectedId,
      distance,
      Math.round(state.zoom * 100),
    ].join("|");
    if (!force && hudSignature === signature) return;
    hudSignature = signature;
    $("atlas").dataset.view = state.destination
      ? "location"
      : isGlobe()
        ? "globe"
        : "map";
    $("map-heading").textContent = state.destination
      ? state.destination.type === "lake"
        ? state.destination.name[language()]
        : L[state.destination.type]
      : isGlobe()
        ? L.world
        : region;
    $("map-local").setAttribute("aria-pressed", String(!isGlobe()));
    $("map-globe").setAttribute("aria-pressed", String(isGlobe()));
    $("map-local").disabled = false;
    $("map-globe").disabled = false;
    $("map-zoom-value").textContent =
      `${Math.round((state.zoom / LOCAL_ZOOM) * 100)}%`;
    $("map-plus").disabled = state.targetZoom >= MAX_ZOOM;
    $("map-minus").disabled = state.targetZoom <= MIN_ZOOM;
    $("map-move-hint").textContent = isGlobe() ? L.rotate : L.move;
    $("map-scroll-hint").textContent = L.zoom;
    $("map-action-hint").textContent = isGlobe() ? L.returnMap : L.interact;
    for (const id of [
      "map-places-toggle",
      "map-context",
      "map-footer",
      "map-compass",
      "map-zoom-tools",
    ])
      $(id).hidden = !!state.destination;
    $("map-places").hidden = !!state.destination || !locationsOpen;
    $("map-places-toggle").setAttribute("aria-expanded", String(locationsOpen));
    $("map-places-toggle").setAttribute(
      "aria-label",
      locationsOpen ? L.hidePlaces : L.showPlaces,
    );
    $("map-places-chevron").textContent = locationsOpen ? "▴" : "▾";
    $("map-context").hidden = !!state.destination || isGlobe();
    $("map-context-label").textContent = nearby ? L.nearby : L.selected;
    $("map-context-name").textContent = place.name[language()];
    $("map-context-hint").textContent = nearby
      ? L.interact
      : `${L.approach} · ${distance} ${L.distance}`;
    $("map-enter").hidden = !nearby;
    $("map-enter").dataset.target = place.id;
    $("map-destination").hidden = !state.destination;
    $("map-destination").classList.toggle(
      "fishing-mode",
      state.destination?.type === "lake",
    );
    for (const button of root.querySelectorAll("[data-place]"))
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.place === state.selectedId),
      );
    $("map-fish-action").hidden = state.destination?.type !== "lake";
    if (state.destination) {
      const destination = state.destination;
      $("map-destination-name").textContent = destination.name[language()];
      $("map-destination-description").textContent =
        destination.description[language()];
      $("map-content-title").textContent =
        destination.type === "shop" ? L.supplies : L.fish;
      $("map-content").textContent =
        destination.type === "shop"
          ? L.stock
          : destination.possibleFish
              .map((fish) => L.fishNames[fish] || fish)
              .join(" · ");
      if (destination.type === "lake") {
        $("map-content-title").textContent = fishing.cast
          ? L.lineInWater
          : L.lineReady;
        $("map-fish-action").textContent = fishing.cast ? L.reel : L.cast;
      }
    }
  }
  function keydown(event) {
    if (!active || event.ctrlKey || event.metaKey || event.altKey) return;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
    const key = event.code;
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
    canvas.focus({ preventScroll: true });
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
    if (target.y >= 282) toggleFishing(target);
  });
  on($("map-plus"), "click", () => setZoom(state.targetZoom * 1.3));
  on($("map-minus"), "click", () => setZoom(state.targetZoom / 1.3));
  on($("map-globe"), "click", showGlobe);
  on($("map-local"), "click", showLocal);
  on($("map-center"), "click", showLocal);
  on($("map-pause"), "click", () => {
    if (active) onPause();
  });
  on($("map-enter"), "click", () => interact($("map-enter").dataset.target));
  on($("map-fish-action"), "click", toggleFishing);
  on($("map-return"), "click", leaveLocation);
  on($("map-places-toggle"), "click", () => setLocationsOpen(!locationsOpen));
  on($("map-places-close"), "click", () => setLocationsOpen(false, true));
  for (const button of root.querySelectorAll("[data-place]"))
    on(button, "click", () => selectLocation(button.dataset.place));

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
    if (now - lastHudTime > 100) {
      updateHud();
      lastHudTime = now;
    }
    frameId = requestAnimationFrame(frame);
  }
  return {
    applyLanguage,
    reset() {
      clearInput();
      state = freshState();
      fishing = { cast: false, startedAt: 0, target: null };
      save();
      updateHud(true);
    },
    enter() {
      if (stopped || active) return;
      renderer ||= createMapRenderer(canvas, language);
      active = true;
      root.classList.add("atlas-active");
      clearInput();
      applyLanguage();
      lastTime = performance.now();
      frameId = requestAnimationFrame(frame);
      (state.destination ? $("map-return") : canvas).focus({
        preventScroll: true,
      });
    },
    exit() {
      active = false;
      cancelAnimationFrame(frameId);
      clearInput();
      save();
      root.classList.remove("atlas-active");
    },
    back() {
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
    }),
    stop() {
      this.exit();
      stopped = true;
      controller.abort();
      renderer?.terrain.dispose();
    },
  };
}
