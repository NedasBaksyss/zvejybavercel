export default function MapEnterButton({ place, language, onEnter, pending, error }) {
  const lt = language === "LT";
  const label = pending ? (lt ? "Jungiamasi…" : "Joining…")
    : error === "full" ? (lt ? "Ežeras pilnas" : "Lake full")
    : error === "unavailable" ? (lt ? "Bandyti vėl" : "Retry entry")
    : place.type === "lake"
    ? (lt ? "Įeiti į ežerą" : "Enter lake")
    : place.type === "shop"
      ? (lt ? "Įeiti į parduotuvę" : "Enter shop")
      : (lt ? "Įeiti" : "Enter");
  return (
    <button className="atlas-enter" id="map-enter" type="button" disabled={pending}
      title={place.name[language]} aria-label={`${label}: ${place.name[language]}`}
      onClick={() => onEnter(place.id)}>
      {label}
    </button>
  );
}
