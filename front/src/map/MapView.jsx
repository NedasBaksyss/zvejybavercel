import { useImperativeHandle } from "react";
import { MAP_TEXT, VIEW } from "./mapData.js";
import { useMap } from "./useMap.js";
import MapHeader from "./components/MapHeader.jsx";
import MapLocations from "./components/MapLocations.jsx";
import MapControls from "./components/MapControls.jsx";
import MapContext from "./components/MapContext.jsx";
import MapDestination from "./components/MapDestination.jsx";
import FishingHud from "./components/FishingHud.jsx";
import "./map.css";

export default function MapView({ ref }) {
  const {
    snapshot,
    actions,
    lifecycle,
    canvasRef,
    placesToggleRef,
    returnRef,
  } = useMap();
  useImperativeHandle(ref, () => lifecycle, [lifecycle]);

  const text = MAP_TEXT[snapshot.language];
  const inLocation = Boolean(snapshot.destination);
  const view = inLocation ? "location" : snapshot.globe ? "globe" : "map";

  return (
    <div className="atlas" id="atlas" data-view={view} onClickCapture={(event) => {
      if (snapshot.fishing.phase === "bite") {
        event.preventDefault();
        event.stopPropagation();
        actions.toggleFishing();
      }
    }}>
      <canvas
        id="map-canvas"
        ref={canvasRef}
        width={VIEW.width}
        height={VIEW.height}
        tabIndex={0}
        aria-label={text.canvas}
      />
      <MapHeader
        text={text}
        language={snapshot.language}
        destination={snapshot.destination}
        globe={snapshot.globe}
        region={snapshot.region}
        onMap={actions.showLocal}
        onGlobe={actions.showGlobe}
        onPause={actions.pause}
        progress={snapshot.progress}
        onRetryProgress={actions.retryProgress}
      />
      <MapLocations
        text={text}
        language={snapshot.language}
        hidden={inLocation}
        open={snapshot.locationsOpen}
        selectedId={snapshot.selectedId}
        toggleRef={placesToggleRef}
        onToggle={actions.toggleLocations}
        onClose={actions.closeLocations}
        onSelect={actions.selectLocation}
      />
      <MapControls
        text={text}
        hidden={inLocation}
        globe={snapshot.globe}
        zoomPercent={snapshot.zoomPercent}
        canZoomIn={snapshot.canZoomIn}
        canZoomOut={snapshot.canZoomOut}
        onZoomIn={actions.zoomIn}
        onZoomOut={actions.zoomOut}
        onCenter={actions.showLocal}
      />
      <MapContext
        text={text}
        language={snapshot.language}
        hidden={inLocation || snapshot.globe}
        place={snapshot.place}
        nearby={snapshot.nearby}
        distance={snapshot.distance}
        onEnter={actions.enterLocation}
      />
      <MapDestination
        text={text}
        language={snapshot.language}
        place={snapshot.destination}
        cast={snapshot.fishingCast}
        returnRef={returnRef}
        onCast={actions.toggleFishing}
        onReturn={actions.leaveLocation}
      />
      {snapshot.destination?.type === "lake" && (
        <FishingHud fishing={snapshot.fishing} language={snapshot.language} fishNames={text.fishNames} />
      )}
    </div>
  );
}
