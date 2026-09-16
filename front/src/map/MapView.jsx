import { LOCATIONS } from "./mapData";
import "./map.css";

export default function MapView() {
  return (
    <div className="atlas" id="atlas">
      <canvas id="map-canvas" width="960" height="540" tabIndex={0} />
      <header className="atlas-header">
        <div className="atlas-heading"><span id="map-eyebrow" /><strong id="map-heading" /></div>
        <div className="atlas-modes" role="group" aria-label="Map / Globe">
          <button type="button" id="map-local" />
          <button type="button" id="map-globe" />
        </div>
        <button type="button" className="atlas-icon" id="map-pause">Ⅱ</button>
      </header>
      <button className="atlas-places-toggle" id="map-places-toggle" type="button" aria-controls="map-places" aria-expanded="false">
        <span id="map-places-toggle-label" /><span className="atlas-place-count">{LOCATIONS.length}</span><span id="map-places-chevron" aria-hidden="true">▾</span>
      </button>
      <aside className="atlas-places" id="map-places" aria-labelledby="map-places-title" hidden>
        <div className="atlas-places-heading"><h2 id="map-places-title" /><button type="button" id="map-places-close">×</button></div>
        <div id="map-location-list">
          {LOCATIONS.map((place, index) => (
            <button type="button" data-place={place.id} key={place.id}>
              <span className={`atlas-dot ${place.type}`} />
              <span className="atlas-place-copy"><strong data-place-name={place.id} /><small data-place-type={place.id} /></span>
              <span className="atlas-number">{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
        <p id="map-list-hint" />
      </aside>
      <div className="atlas-compass" id="map-compass" aria-hidden="true"><b>N</b><span>✦</span></div>
      <div className="atlas-zoom" id="map-zoom-tools">
        <button type="button" id="map-plus">+</button>
        <output id="map-zoom-value" />
        <button type="button" id="map-minus">−</button>
        <button type="button" id="map-center">⌖</button>
      </div>
      <div className="atlas-context" id="map-context">
        <span id="map-context-label" /><strong id="map-context-name" />
        <p id="map-context-hint" /><button type="button" id="map-enter" />
      </div>
      <footer className="atlas-footer" id="map-footer">
        <span id="map-move-hint" /><span id="map-scroll-hint" /><span id="map-action-hint" />
      </footer>
      <section className="atlas-destination" id="map-destination" hidden>
        <div className="atlas-destination-card">
          <span className="atlas-eyebrow" id="map-arrived" />
          <h2 id="map-destination-name" />
          <p id="map-destination-description" />
          <h3 id="map-content-title" /><p id="map-content" />
          <button type="button" id="map-return" />
        </div>
      </section>
    </div>
  );
}
