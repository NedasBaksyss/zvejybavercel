export default function MapHeader({
  text,
  globe,
  onMap,
  onGlobe,
  onPause,
}) {
  return (
    <header className="atlas-header">
      <div
        className="atlas-modes"
        role="group"
        aria-label={`${text.map} / ${text.globe}`}
      >
        <button
          type="button"
          id="map-local"
          title={text.map}
          aria-label={text.map}
          aria-pressed={!globe}
          onClick={onMap}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges">
            <path fill="#203d35" d="M1 3h4V2h5v1h5v11h-5v1H5v-1H1z" />
            <path fill="#e3cc8e" d="M2 4h3v9H2zM10 4h4v9h-4z" />
            <path fill="#bcaa72" d="M5 3h4v11H5z" />
            <path fill="#f2dfa8" d="M2 4h1v9H2zM10 4h1v9h-1z" />
            <path fill="#648a56" d="M3 6h2v1H3zM5 7h2v1H5zM7 8h3v1H7zM10 7h2v1h-2z" />
            <path fill="#a95c43" d="M11 5h2v2h-2zM12 7h1v1h-1z" />
          </svg>
        </button>
        <button
          type="button"
          id="map-globe"
          title={text.globe}
          aria-label={text.globe}
          aria-pressed={globe}
          onClick={onGlobe}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges">
            <path fill="#183a3d" d="M5 1h6v1h2v2h1v2h1v5h-1v2h-2v1H4v-1H2v-2H1V6h1V4h1V2h2z" />
            <path fill="#468896" d="M5 2h6v1h2v3h1v5h-2v2H4v-1H3v-2H2V6h1V4h2z" />
            <path fill="#83ad70" d="M4 4h3v1h2v2H7v2H5V7H3V5h1zM10 8h3v3h-2v2H9v-3h1z" />
            <path fill="#b0d2bc" d="M5 3h1v1H5zM3 7h1v3H3z" />
            <path fill="#d7b77c" d="M0 5h1v7h2v2h9v1H2v-2H0zM7 14h2v1H7zM5 15h6v1H5z" />
          </svg>
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
