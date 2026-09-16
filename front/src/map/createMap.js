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
    state.camera = { ...state.player };
    setZoom(LOCAL_ZOOM);
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
      ? L[state.destination.type]
      : isGlobe()
        ? L.world
        : region;
    $("map-local").setAttribute("aria-pressed", String(!isGlobe()));
    $("map-globe").setAttribute("aria-pressed", String(isGlobe()));
    $("map-local").disabled = $("map-globe").disabled = !!state.destination;
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
    for (const button of root.querySelectorAll("[data-place]"))
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.place === state.selectedId),
      );
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

