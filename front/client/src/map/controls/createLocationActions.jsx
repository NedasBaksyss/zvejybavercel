import { createFishingState, castLine, hookFish } from "../fishing.js";
import { chooseLakePlatform, getLakeFishingSpot } from "../lakePlatforms.js";
import { createLakeSession } from "../../multiplayer/createLakeSession.js";
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
  socket,
}) {
  function applySpot(fishing) {
    runtime.state.platformId = fishing?.platformId || runtime.state.platformId;
    runtime.state.spotIndex = fishing?.spotIndex ?? null;
    const platform = getCurrentPlatform();
    runtime.fishing = createFishingState(platform ? { ...platform.target } : null);
    runtime.state.locationError = null;
    save();
    publish(true);
  }
  const lakeSession = createLakeSession({ socket, runtime, publish, applySpot, leaveLocation });

  function publishFishingState(fishing) {
    if (socket.connected) socket.emit("player:fishing", { fishing });
  }

  function getCurrentPlatform() {
    if (!runtime.state.destination || runtime.state.destination.type !== "lake") return null;
    return getLakeFishingSpot(
      runtime.state.destination.id,
      runtime.state.platformId,
      runtime.state.spotIndex,
    );
  }

function buildFishingPresence(active = false) {
  const destination = runtime.state.destination;

  if (!destination || destination.type !== "lake") return null;

  const platform = getCurrentPlatform();
  if (!platform) return null;

  return {
    active,
    lakeId: destination.id,
    platformId: platform.id,
    spotIndex: runtime.state.spotIndex,
    x: platform.angler.x,
    y: platform.angler.y,
    direction: platform.angler.direction || "down",
    scale: platform.scale || 1,

    phase: runtime.fishing.phase,

    target:
      active && runtime.fishing.cast && runtime.fishing.target
        ? {
            x: runtime.fishing.target.x,
            y: runtime.fishing.target.y,
          }
        : null,
  };
}

  function enterLocation(id) {
    if (
      !runtime.active ||
      runtime.state.enteringLocation ||
      runtime.state.destination ||
      runtime.state.zoom < GLOBE_START ||
      isGlobe()
    ) return false;
    const place = LOCATIONS.find((item) => item.id === id);
    if (!place) return false;
    runtime.state.selectedId = place.id;
    if (distanceTo(runtime.state.player, place) > INTERACTION_DISTANCE) {
      publish(true);
      return false;
    }
    clearInput();
    if (place.type === "lake") {
      const preferred = chooseLakePlatform(place.id);
      return lakeSession.join(place.id, preferred?.id, (fishing) => {
        runtime.state.platformId = fishing.platformId;
        runtime.state.spotIndex = fishing.spotIndex;
        finishEntry(place);
      });
    }
    finishEntry(place);
    return true;
  }

  function finishEntry(place) {
    runtime.state.player = { ...place.entry };
    runtime.state.destination = place;
    runtime.state.locationError = null;

    if (place.type === "lake") {
      const platform = getCurrentPlatform();
      runtime.fishing = createFishingState(
        platform ? { ...platform.target } : null,
      );

      /*
       * Important:
       * Tell other clients immediately that this player is
       * inside this lake and where their character is.
       *
       * active:false means they are NOT fishing yet, so
       * remote clients render the player but no bobber/line.
       */
      publishFishingState(buildFishingPresence(false));
    } else {
      runtime.state.platformId = null;
      runtime.state.spotIndex = null;
      runtime.fishing = createFishingState();
    }

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
      platformId: runtime.state.platformId,
      spotIndex: runtime.state.spotIndex,
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
    ) return false;
    if (!getCurrentPlatform() || !socket.connected) return false;

    if (runtime.fishing.phase === "bite") {
      hookFish(runtime.fishing);

      publishFishingState(buildFishingPresence(true));

      clearInput();
      onFocus("canvas");
      publish(true);
      return true;
    }

    if (!["idle", "waiting"].includes(runtime.fishing.phase)) return false;

    const wasCasting = Boolean(runtime.fishing.cast);

    runtime.fishing = wasCasting
      ? createFishingState(runtime.fishing.target)
      : castLine(target || runtime.fishing.target);

    /*
     * Reuse the SAME platform selected on lake entry.
     * Never call chooseLakePlatform() here.
     */
    publishFishingState(
      buildFishingPresence(Boolean(runtime.fishing.cast)),
    );

    publish(true);

    emit(
      runtime.fishing.cast ? "castLine" : "reelLine",
      {
        id: runtime.state.destination.id,
        slot: getSlot(),
      },
    );

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
    if (
      runtime.stopped ||
      !runtime.state.destination
    ) return false;

    const locationId = runtime.state.destination.id;

    /*
     * Remove the player's remote lake presence BEFORE
     * clearing the local state.
     */
    lakeSession.leave();

    runtime.state.destination = null;
    runtime.state.platformId = null;
    runtime.state.spotIndex = null;
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

  return {
    enterLocation,
    toggleFishing,
    interact,
    leaveLocation,
    buildFishingPresence,
    publishFishingState,
    cancelEntry: lakeSession.cancelEntry,
    releaseSpot: lakeSession.leave,
    dispose: lakeSession.dispose,
  };
}
