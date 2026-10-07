export default function MapContext({
  text,
  language,
  hidden,
  place,
  nearby,
  distance,
  onEnter,
}) {
  return (
    <div className="atlas-context" id="map-context" hidden={hidden}>
      <span id="map-context-label">{nearby ? text.nearby : text.selected}</span>
      <strong id="map-context-name">{place.name[language]}</strong>
      <p id="map-context-hint">
        {nearby
          ? text.interact
          : `${text.approach} · ${distance} ${text.distance}`}
      </p>
      <button
        type="button"
        id="map-enter"
        hidden={!nearby}
        onClick={() => onEnter(place.id)}
      >
        {text.enter}
      </button>
    </div>
  );
}
