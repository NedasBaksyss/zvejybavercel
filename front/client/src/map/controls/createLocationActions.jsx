import { createFishingState, castLine, hookFish } from "../fishing.js";
import { chooseLakePlatform, getLakePlatform } from "../lakePlatforms.js";
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
  function publishFishingState(fishing) {
    socket.emit("player:fishing", { fishing });
  }

  function getCurrentPlatform() {
    if (!runtime.state.destination || runtime.state.destination.type !== "lake") return null;
    return getLakePlatform(
      runtime.state.destination.id,
      runtime.state.platformId,
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
      x: platform.angler.x,
      y: platform.angler.y,
      direction: platform.angler.direction || "down",
      scale: platform.scale || 1,
      target: active && runtime.fishing?.cast && runtime.fishing?.target
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
      runtime.state.entryPending ||
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
    runtime.state.entryError = null;
    if (place.type !== "lake") return completeEntry(place, null);

    const occupied = [...runtime.remotePlayers.values()]
      .filter((player) => player.fishing?.lakeId === place.id)
      .map((player) => player.fishing.platformId);
    const platform = chooseLakePlatform(place.id, Math.random, occupied);
    if (!platform) {
      runtime.state.entryError = { id: place.id, reason: "full" };
      publish(true);
      return false;
    }
    if (!socket.connected) return completeEntry(place, platform);

    runtime.state.entryPending = true;
    clearInput();
    publish(true);
    socket.timeout(5000).emit("player:reserve-platform", {
      lakeId: place.id, platformId: platform.id,
    }, (error, result) => {
      runtime.state.entryPending = false;
      if (!runtime.active || runtime.stopped || runtime.state.destination ||
        distanceTo(runtime.state.player, place) > INTERACTION_DISTANCE) {
        if (!error && result?.platformId) publishFishingState(null);
        publish(true);
        return;
      }
      if (error || !result?.platformId) {
        runtime.state.entryError = { id: place.id, reason: result?.error === "full" ? "full" : "unavailable" };
        publish(true);
        return;
      }
      completeEntry(place, getLakePlatform(place.id, result.platformId));
    });
    return true;
  }

  function completeEntry(place, platform) {
    clearInput();
    runtime.state.player = { ...place.entry };
    runtime.state.destination = place;

    if (place.type === "lake") {
      runtime.state.platformId = platform?.id || null;
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
      !runtime.active ||
      runtime.stopped ||
      !runtime.state.destination
    ) return false;

    const locationId = runtime.state.destination.id;

    /*
     * Remove the player's remote lake presence BEFORE
     * clearing the local state.
     */
    publishFishingState(null);

    runtime.state.destination = null;
    runtime.state.platformId = null;
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
  };
}
