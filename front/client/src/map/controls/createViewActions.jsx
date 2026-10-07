import {
  WORLD,
  LOCATIONS,
  LOCAL_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  GLOBE_SWITCH,
  clamp,
} from "../mapData.js";
import { writeLocationsPreference } from "./mapStorage.jsx";

export function createViewActions({
  runtime,
  isGlobe,
  clearInput,
  publish,
  onFocus,
  leaveLocation,
}) {
  function setLocationsOpen(open, focusToggle = false) {
    if (!runtime.active || runtime.stopped) return;
    runtime.locationsOpen = open;
    clearInput();
    writeLocationsPreference(open);
    publish(true);
    if (focusToggle) onFocus("places");
  }

  function selectLocation(id) {
    if (!runtime.active || runtime.stopped) return;
    const place = LOCATIONS.find((item) => item.id === id);
    if (!place) return;
    runtime.state.selectedId = id;
    if (isGlobe() && place) {
      runtime.state.longitude = (place.x / WORLD.width) * Math.PI * 2 - Math.PI;
      runtime.state.latitude = Math.PI / 2 - (place.y / WORLD.height) * Math.PI;
    }
    publish(true);
  }

  function setZoom(value) {
    if (runtime.state.destination || !runtime.active) return;
    clearInput();
    runtime.state.targetZoom = clamp(value, MIN_ZOOM, MAX_ZOOM);
    if (runtime.reducedMotion.matches)
      runtime.state.zoom = runtime.state.targetZoom;
    if (
      runtime.state.targetZoom >= GLOBE_SWITCH &&
      runtime.state.zoom < GLOBE_SWITCH
    )
      runtime.state.camera = { ...runtime.state.player };
    publish(true);
  }

  function showLocal() {
    if (!runtime.active || runtime.stopped) return;
    if (runtime.state.destination) leaveLocation();
    runtime.state.camera = { ...runtime.state.player };
    setZoom(LOCAL_ZOOM);
    onFocus("canvas");
  }

  function showGlobe() {
    if (!runtime.active || runtime.stopped) return;
    if (runtime.state.destination) leaveLocation();
    setZoom(MIN_ZOOM);
    onFocus("canvas");
  }
  return {
    setLocationsOpen,
    selectLocation,
    setZoom,
    showLocal,
    showGlobe,
    zoomIn: () => setZoom(runtime.state.targetZoom * 1.3),
    zoomOut: () => setZoom(runtime.state.targetZoom / 1.3),
    toggleLocations: () => setLocationsOpen(!runtime.locationsOpen),
    closeLocations: () => setLocationsOpen(false, true),
  };
}
