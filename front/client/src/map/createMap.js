import { GLOBE_SWITCH } from "./mapData.js";
import { createFishingState } from "./fishing.js";
import { createMapRenderer } from "./mapRenderer.js";
import { createMapSnapshot, createMapState } from "./mapState.js";
import { createLocationActions } from "./controls/createLocationActions.jsx";
import { createViewActions } from "./controls/createViewActions.jsx";
import { createMapInput } from "./controls/createMapInput.jsx";
import { createMapLoop } from "./controls/createMapLoop.jsx";
import {
  readLocationsPreference,
  saveMapState,
} from "./controls/mapStorage.jsx";

import { socket, connectSocket } from "../multiplayer/socket.js";
import { createPlayerSync } from "../multiplayer/playerSync.js";

export function createMap({
  canvas,
  getLanguage,
  getSlot,
  emit,
  onPause,
  onSettings,
  onChange,
  onFocus,
}) {

  const runtime = {
    state: createMapState(),
    fishing: createFishingState(),

    remotePlayers: new Map(),

    locationsOpen: readLocationsPreference(),
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)"),
    renderer: null,
    active: false,
    stopped: false,
    progress: null,
  };
  const keys = new Set();
  const language = () => (getLanguage() === "LT" ? "LT" : "EN");
  const isGlobe = () => runtime.state.targetZoom < GLOBE_SWITCH;
  const save = () => saveMapState(getSlot(), runtime.state);
  let snapshot = null;
  let input = null;
  const clearInput = () => input?.clear();

  function publish(force = false) {
    if (runtime.stopped) return;
    const next = createMapSnapshot(runtime.state, {
      progress: runtime.progress,
      language: language(),
      active: runtime.active,
      locationsOpen: runtime.locationsOpen,
      fishingCast: runtime.fishing.cast,
      fishing: { ...runtime.fishing },
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

  const playerSync = createPlayerSync(
    socket,
    runtime,
    publish,
  );

  const locations = createLocationActions({
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
  });
  const view = createViewActions({
    runtime,
    isGlobe,
    clearInput,
    publish,
    onFocus,
    leaveLocation: locations.leaveLocation,
  });
  input = createMapInput({
    canvas,
    runtime,
    keys,
    isGlobe,
    actions: { ...locations, ...view },
    onFocus,
  });
  const loop = createMapLoop({ 
    runtime,
    keys,
    save,
    publish,
    getSlot,
    emit,
    socket,
    buildFishingPresence: locations.buildFishingPresence,
    publishFishingState: locations.publishFishingState,
   });

  function exit() {
    runtime.active = false;
    loop.stop();
    clearInput();
    save();
    publish();
  }

  return {
    setProgress(value) { runtime.progress = value; publish(true); },
    applyLanguage: () => publish(true),
    showLocal: view.showLocal,
    showGlobe: view.showGlobe,
    selectLocation: view.selectLocation,
    enterLocation: locations.enterLocation,
    leaveLocation: locations.leaveLocation,
    toggleFishing: locations.toggleFishing,
    zoomIn: view.zoomIn,
    zoomOut: view.zoomOut,
    toggleLocations: view.toggleLocations,
    closeLocations: view.closeLocations,
    pause() {
      if (runtime.active && !runtime.stopped) onPause();
    },
    openSettings() {
      if (runtime.active && !runtime.stopped) onSettings();
    },
    reset() {
      if (runtime.stopped) return;
      clearInput();
      runtime.state = createMapState();
      runtime.fishing = createFishingState();
      save();
      publish(true);
    },
    enter() {
      if (runtime.stopped || runtime.active) return;
      runtime.renderer ||= createMapRenderer(
        canvas,
        language,
        runtime.remotePlayers,
      );

      runtime.active = true;
      clearInput();
      publish(true);
      loop.start();
      onFocus(
        runtime.state.destination && runtime.state.destination.type !== "lake"
          ? "return"
          : "canvas",
      );
    },
    exit,
    back() {
      if (!runtime.active || runtime.stopped) return false;
      if (locations.leaveLocation()) return true;
      if (runtime.locationsOpen) {
        view.closeLocations();
        return true;
      }
      return false;
    },
    getState: () => ({
      ...runtime.state,
      locationsOpen: runtime.locationsOpen,
      player: { ...runtime.state.player },
      camera: { ...runtime.state.camera },
      fishing: {
        ...runtime.fishing,
        target: runtime.fishing.target ? { ...runtime.fishing.target } : null,
      },
    }),
    stop() {
      if (runtime.stopped) return;

      runtime.stopped = true;

      exit();

      playerSync.dispose();

      input.stop();
      runtime.renderer?.dispose();
    }
  };
}
