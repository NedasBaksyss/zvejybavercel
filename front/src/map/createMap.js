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

