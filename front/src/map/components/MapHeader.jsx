export default function MapHeader({
  text,
  language,
  destination,
  globe,
  region,
  onMap,
  onGlobe,
  onPause,
}) {
  const heading = destination
    ? destination.type === "lake"
      ? destination.name[language]
      : text[destination.type]
    : globe
      ? text.world
      : region;

  return (
    <header className="atlas-header">
      <div className="atlas-heading">
        <span id="map-eyebrow">{text.title}</span>
        <strong id="map-heading">{heading}</strong>
      </div>
      <div
        className="atlas-modes"
        role="group"
        aria-label={`${text.map} / ${text.globe}`}
      >
        <button
          type="button"
          id="map-local"
          aria-pressed={!globe}
          onClick={onMap}
        >
          {text.map}
        </button>
        <button
          type="button"
          id="map-globe"
          aria-pressed={globe}
          onClick={onGlobe}
        >
          {text.globe}
        </button>
      </div>
      <button
        type="button"
        className="atlas-icon"
        id="map-pause"
        title={text.pause}
        aria-label={text.pause}
        onClick={onPause}
      >
        Ⅱ
      </button>
    </header>
  );
}
