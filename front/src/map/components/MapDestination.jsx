export default function MapDestination({
  text,
  language,
  place,
  cast,
  returnRef,
  onCast,
  onReturn,
}) {
  const lake = place?.type === "lake";
  const shop = place?.type === "shop";
  const contentTitle = lake
    ? cast
      ? text.lineInWater
      : text.lineReady
    : shop
      ? text.supplies
      : text.fish;

  return (
    <section
      className={`atlas-destination${lake ? " fishing-mode" : ""}`}
      id="map-destination"
      hidden={!place}
    >
      {place && (
        <div className="atlas-destination-card">
          <span className="atlas-eyebrow" id="map-arrived">
            {text.arrived}
          </span>
          <h2 id="map-destination-name">{place.name[language]}</h2>
          <p id="map-destination-description">{place.description[language]}</p>
          <h3 id="map-content-title">{contentTitle}</h3>
          <p id="map-content">
            {shop
              ? text.stock
              : place.possibleFish
                  .map((fish) => text.fishNames[fish] || fish)
                  .join(" · ")}
          </p>
          <button
            type="button"
            id="map-fish-action"
            hidden={!lake}
            aria-pressed={cast}
            onClick={onCast}
          >
            {cast ? text.reel : text.cast}
          </button>
          <button
            type="button"
            id="map-return"
            ref={returnRef}
            onClick={onReturn}
          >
            {text.back}
          </button>
        </div>
      )}
    </section>
  );
}
