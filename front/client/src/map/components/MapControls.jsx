export default function MapControls({
  text,
  hidden,
  zoomPercent,
  canZoomIn,
  canZoomOut,
  onZoomIn,
  onZoomOut,
  onCenter,
}) {
  return (
    <>
      <div
        className="atlas-compass"
        id="map-compass"
        aria-hidden="true"
        hidden={hidden}
      >
        <b>N</b>
        <span>✦</span>
      </div>
      <div className="atlas-zoom" id="map-zoom-tools" hidden={hidden}>
        <button
          type="button"
          id="map-plus"
          title={text.zoomIn}
          aria-label={text.zoomIn}
          disabled={!canZoomIn}
          onClick={onZoomIn}
        >
          +
        </button>
        <output id="map-zoom-value">{zoomPercent}%</output>
        <button
          type="button"
          id="map-minus"
          title={text.zoomOut}
          aria-label={text.zoomOut}
          disabled={!canZoomOut}
          onClick={onZoomOut}
        >
          −
        </button>
        <button
          type="button"
          id="map-center"
          title={text.focus}
          aria-label={text.focus}
          onClick={onCenter}
        >
          ⌖
        </button>
      </div>
    </>
  );
}
