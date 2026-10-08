export default function MapEnterButton({ place, language, onEnter }) {
  const lt = language === "LT";
  const label = place.type === "lake"
    ? (lt ? "Įeiti į ežerą" : "Enter lake")
    : place.type === "shop"
      ? (lt ? "Įeiti į parduotuvę" : "Enter shop")
      : (lt ? "Įeiti" : "Enter");
  return (
    <button className="atlas-enter" id="map-enter" type="button"
      title={place.name[language]} aria-label={`${label}: ${place.name[language]}`}
      onClick={() => onEnter(place.id)}>
      {label}
    </button>
  );
}
