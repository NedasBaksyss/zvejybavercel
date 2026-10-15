export default function MapEnterButton({ place, language, onEnter, pending }) {
  const lt = language === "LT";
  const label = place.type === "lake"
    ? (lt ? "Įeiti į ežerą" : "Enter lake")
    : place.type === "shop"
      ? (lt ? "Įeiti į parduotuvę" : "Enter shop")
      : (lt ? "Įeiti" : "Enter");
  return (
    <button className="atlas-enter" id="map-enter" type="button"
      title={place.name[language]} aria-label={`${label}: ${place.name[language]}`}
      disabled={pending} onClick={() => onEnter(place.id)}>
      {label}
    </button>
  );
}

export function MapEntryStatus({ language, error, pending }) {
  if (!error && !pending) return null;
  const text = language === "LT"
    ? { pending: "Ieškoma laisvos vietos…", full: "Visos vietos užimtos. Bandykite kitą ežerą.", offline: "Jungiamasi prie žaidimo serverio…", timeout: "Nepavyko prisijungti. Bandykite dar kartą.", invalid: "Nepavyko įeiti į ežerą." }
    : { pending: "Finding a free spot…", full: "This lake is full. Try another lake.", offline: "Connecting to the game server…", timeout: "Could not connect. Please try again.", invalid: "Could not enter the lake." };
  return <p className="atlas-entry-status" role="status">{text[pending ? "pending" : error] || text.invalid}</p>;
}
