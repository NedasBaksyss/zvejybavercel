import {
  WORLD,
  SPAWN,
  LOCAL_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  GLOBE_START,
  GLOBE_SWITCH,
  INTERACTION_DISTANCE,
  LOCATIONS,
  distanceTo,
  nearestLocation,
  regionName,
} from "./mapData.js";

export function createMapState() {
  return {
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
  };
}

export function createMapSnapshot(
  state,
  {
    language = "EN",
    active = false,
    locationsOpen = false,
    fishingCast = false,
  } = {},
) {
  const globe = state.targetZoom < GLOBE_SWITCH;
  const nearest = nearestLocation(state.player);
  const nearby =
    state.zoom >= GLOBE_START &&
    !globe &&
    distanceTo(state.player, nearest) <= INTERACTION_DISTANCE;
  const selected = LOCATIONS.find((place) => place.id === state.selectedId);
  const place = nearby ? nearest : selected || nearest;

  return {
    language,
    active,
    globe,
    region: regionName(state.player, language),
    zoomPercent: Math.round((state.zoom / LOCAL_ZOOM) * 100),
    canZoomIn: state.targetZoom < MAX_ZOOM,
    canZoomOut: state.targetZoom > MIN_ZOOM,
    locationsOpen,
    selectedId: state.selectedId,
    destination: state.destination,
    place,
    nearby,
    distance: Math.round(distanceTo(state.player, place)),
    fishingCast,
  };
}
