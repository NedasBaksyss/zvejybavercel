export default function MapSettingsButton({ language, onOpen }) {
  const label = language === "LT" ? "Nustatymai" : "Settings";
  return (
    <button className="atlas-settings" type="button" title={label} aria-label={label} onClick={onOpen}>
      <svg viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges">
        <path fill="#091d22" d="M5 0h6v3h2V2h2v3h-1v6h1v3h-2v-1h-2v3H5v-3H3v1H1v-3h1V5H1V2h2v1h2z" />
        <path fill="#b9c9a1" d="M6 1h4v3h2V3h2v2h-2v1h2v4h-2v1h2v2h-2v-1h-2v3H6v-3H4v1H2v-2h2v-1H2V6h2V5H2V3h2v1h2z" />
        <path fill="#6b8c79" d="M3 9h1v2h2v3h4v-3h2V9h1v2h1v2h-2v-1h-2v3H6v-3H4v1H2v-2h1z" />
        <path fill="#0c282c" d="M6 5h4v1h1v4h-1v1H6v-1H5V6h1z" />
        <path fill="#43645b" d="M7 6h2v1H7z" />
      </svg>
    </button>
  );
}
