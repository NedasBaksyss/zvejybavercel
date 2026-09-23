import { LOCATIONS } from "../mapData.js";

export default function MapLocations({
  text,
  language,
  hidden,
  open,
  selectedId,
  toggleRef,
  onToggle,
  onClose,
  onSelect,
}) {
  return (
    <>
      <button
        className="atlas-places-toggle"
        id="map-places-toggle"
        type="button"
        ref={toggleRef}
        hidden={hidden}
        aria-controls="map-places"
        aria-expanded={open}
        aria-label={open ? text.hidePlaces : text.showPlaces}
        onClick={onToggle}
      >
        <span id="map-places-toggle-label">{text.placesButton}</span>
        <span className="atlas-place-count">{LOCATIONS.length}</span>
        <span id="map-places-chevron" aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>
      <aside
        className="atlas-places"
        id="map-places"
        aria-labelledby="map-places-title"
        hidden={hidden || !open}
      >
        <div className="atlas-places-heading">
          <h2 id="map-places-title">{text.places}</h2>
          <button
            type="button"
            id="map-places-close"
            title={text.hidePlaces}
            aria-label={text.hidePlaces}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div id="map-location-list">
          {LOCATIONS.map((place, index) => (
            <button
              type="button"
              data-place={place.id}
              key={place.id}
              aria-pressed={place.id === selectedId}
              onClick={() => onSelect(place.id)}
            >
              <span className={`atlas-dot ${place.type}`} aria-hidden="true" />
              <span className="atlas-place-copy">
                <strong data-place-name={place.id}>
                  {place.name[language]}
                </strong>
                <small data-place-type={place.id}>{text[place.type]}</small>
              </span>
              <span className="atlas-number">
                {String(index + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
        <p id="map-list-hint">{text.listHint}</p>
      </aside>
    </>
  );
}
