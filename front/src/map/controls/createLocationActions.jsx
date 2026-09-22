import { createFishingState, castLine, hookFish } from "../fishing.js";
import {
  LOCATIONS,
  MAP_VERSION,
  GLOBE_START,
  INTERACTION_DISTANCE,
  distanceTo,
  nearestLocation,
} from "../mapData.js";

export function createLocationActions({
  runtime,
  isGlobe,
  language,
  getSlot,
  emit,
  onFocus,
  clearInput,
  save,
  publish,
}) {
  function enterLocation(id) {
    if (
      !runtime.active ||
      runtime.state.destination ||
      runtime.state.zoom < GLOBE_START ||
      isGlobe()
    )
      return false;
    const place = LOCATIONS.find((item) => item.id === id);
    if (!place) return false;
    runtime.state.selectedId = place.id;
    if (distanceTo(runtime.state.player, place) > INTERACTION_DISTANCE) {
      publish(true);
      return false;
    }
    clearInput();
    runtime.state.player = { ...place.entry };
    runtime.state.destination = place;
    runtime.fishing = createFishingState();
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
    if (
      !runtime.active ||
      !runtime.state.destination ||
      runtime.state.destination.type !== "lake"
    )
      return false;
    if (runtime.fishing.phase === "bite") {
      hookFish(runtime.fishing);
      clearInput();
      onFocus("canvas");
      publish(true);
      return true;
    }
    if (!["idle", "waiting"].includes(runtime.fishing.phase)) return false;
    runtime.fishing = runtime.fishing.cast
      ? createFishingState(runtime.fishing.target)
      : castLine(target || runtime.fishing.target);
    publish(true);
    emit(runtime.fishing.cast ? "castLine" : "reelLine", {
      id: runtime.state.destination.id,
      slot: getSlot(),
    });
    return true;
  }

  function interact(id) {
    const selected = LOCATIONS.find(
      (place) => place.id === runtime.state.selectedId,
    );
    const nearest = nearestLocation(runtime.state.player);
    return enterLocation(
      id ||
        (selected &&
        distanceTo(runtime.state.player, selected) <= INTERACTION_DISTANCE
          ? selected.id
          : nearest.id),
    );
  }

  function leaveLocation() {
    if (!runtime.active || runtime.stopped || !runtime.state.destination)
      return false;
    const locationId = runtime.state.destination.id;
    runtime.state.destination = null;
    runtime.fishing = createFishingState();
    runtime.state.camera = { ...runtime.state.player };
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
  return { enterLocation, toggleFishing, interact, leaveLocation };
}
