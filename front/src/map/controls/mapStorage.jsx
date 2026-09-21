import { MAP_VERSION } from "../mapData.js";

const LOCATIONS_PREFERENCE = "zvejyba.map.locationsOpen";

export function readLocationsPreference() {
  try {
    return localStorage.getItem(LOCATIONS_PREFERENCE) === "true";
  } catch {
    return false;
  }
}

export function writeLocationsPreference(open) {
  try {
    localStorage.setItem(LOCATIONS_PREFERENCE, String(open));
  } catch {}
}

export function saveMapState(slot, state) {
  if (!slot) return;
  slot.map = {
    mapId: "main_map",
    version: MAP_VERSION,
    position: { ...state.player },
    selectedId: state.selectedId,
    locationId: state.destination?.id || null,
  };
}
