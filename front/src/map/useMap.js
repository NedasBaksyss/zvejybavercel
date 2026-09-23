import { useEffect, useMemo, useRef, useState } from "react";
import { createMap } from "./createMap.js";
import { createMapSnapshot, createMapState } from "./mapState.js";

export function useMap() {
  const canvasRef = useRef(null);
  const placesToggleRef = useRef(null);
  const returnRef = useRef(null);
  const controllerRef = useRef(null);
  const bindingsRef = useRef({});
  const [snapshot, setSnapshot] = useState(() =>
    createMapSnapshot(createMapState()),
  );
  const [focusRequest, setFocusRequest] = useState(null);

  useEffect(() => {
    const controller = createMap({
      canvas: canvasRef.current,
      getLanguage: () => bindingsRef.current.getLanguage?.() || "EN",
      getSlot: () => bindingsRef.current.getSlot?.(),
      emit: (event, data) => bindingsRef.current.emit?.(event, data),
      onPause: () => bindingsRef.current.onPause?.(),
      onChange: setSnapshot,
      onFocus: (target) => setFocusRequest({ target }),
    });
    controllerRef.current = controller;
    controller.applyLanguage();

    return () => {
      controller.stop();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!snapshot.active || !focusRequest) return;
    const targets = {
      canvas: canvasRef,
      places: placesToggleRef,
      return: returnRef,
    };
    targets[focusRequest.target]?.current?.focus({ preventScroll: true });
  }, [focusRequest, snapshot.active]);

  const lifecycle = useMemo(
    () => ({
      configure(bindings) {
        bindingsRef.current = bindings;
        controllerRef.current?.applyLanguage();
      },
      applyLanguage: () => controllerRef.current?.applyLanguage(),
      reset: () => controllerRef.current?.reset(),
      enter: () => controllerRef.current?.enter(),
      exit: () => controllerRef.current?.exit(),
      back: () => controllerRef.current?.back() || false,
      getState: () => controllerRef.current?.getState(),
      stop: () => controllerRef.current?.stop(),
    }),
    [],
  );

  const actions = useMemo(
    () => ({
      showLocal: () => controllerRef.current?.showLocal(),
      showGlobe: () => controllerRef.current?.showGlobe(),
      zoomIn: () => controllerRef.current?.zoomIn(),
      zoomOut: () => controllerRef.current?.zoomOut(),
      pause: () => controllerRef.current?.pause(),
      selectLocation: (id) => controllerRef.current?.selectLocation(id),
      toggleLocations: () => controllerRef.current?.toggleLocations(),
      closeLocations: () => controllerRef.current?.closeLocations(),
      enterLocation: (id) => controllerRef.current?.enterLocation(id),
      leaveLocation: () => controllerRef.current?.leaveLocation(),
      toggleFishing: () => controllerRef.current?.toggleFishing(),
    }),
    [],
  );

  return {
    snapshot,
    actions,
    lifecycle,
    canvasRef,
    placesToggleRef,
    returnRef,
  };
}
