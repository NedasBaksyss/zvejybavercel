import { CONTROL_WIDTH } from "../fishing.js";

const COPY = {
  EN: {
    idle: "Click the water to cast · E / Space to cast or reel",
    waiting: "Waiting for a bite…",
    bite: "A bite! Click anywhere to hook the fish",
    fighting: "Tap A / D to steer · Keep the fish inside the light bar",
    caught: "Fish caught!", lost: "The fish got away!",
    again: "Get ready to cast again…", progress: "Catch progress",
  },
  LT: {
    idle: "Spustelk vandenį · E / tarpas – mesti arba susukti valą",
    waiting: "Laukiama kibimo…",
    bite: "Kimba! Spustelk bet kur, kad pakirstum žuvį",
    fighting: "Spustelk A / D krypčiai keisti · Sek žuvį šviesia juosta",
    caught: "Žuvis pagauta!", lost: "Žuvis paspruko!",
    again: "Netrukus galėsi mesti vėl…", progress: "Pagavimo eiga",
  },
};

export default function FishingHud({ fishing, language, fishNames }) {
  const text = COPY[language];
  const {
    phase,
    control,
    fishPosition,
    fishGoal,
    progress,
    tracking,
    fish,
  } = fishing;
  const result = phase === "caught" || phase === "lost";
  return (
    <>
      <p className={`fishing-message ${phase}`} role="status" aria-live="polite">
        {text[phase]}{phase === "caught" ? ` · ${fishNames[fish] || fish}` : ""}
      </p>
      <div className={`fishing-hud ${phase}`}>
      {phase === "fighting" && (
        <>
          <div
            className={`fishing-track ${tracking ? "tracking" : "escaping"}`}
            aria-hidden="true"
          >
            <span
              className="fishing-control"
              style={{
                left: `${(control - CONTROL_WIDTH / 2) * 100}%`,
                width: `${CONTROL_WIDTH * 100}%`,
              }}
            >
              <span>«</span><span>»</span>
            </span>
            <span
              className={`fishing-fish ${fishGoal < fishPosition ? "swimming-left" : "swimming-right"}`}
              style={{ left: `${fishPosition * 100}%` }}
            >
              <svg viewBox="0 0 20 12" shapeRendering="crispEdges">
                <path
                  className="fish-tail"
                  d="M0 1h3v2h3v6H3v2H0V8h2V4H0z"
                />
                <path
                  className="fish-body"
                  d="M5 3h2V1h7v1h3v2h2v4h-2v2h-3v1H7V9H5z"
                />
                <path className="fish-fin" d="M8 9h5v3h-2v-1H8z" />
                <rect className="fish-shine" x="8" y="3" width="5" height="2" />
                <rect className="fish-eye" x="15" y="4" width="2" height="2" />
              </svg>
            </span>
          </div>
          <div className="fishing-progress" role="progressbar" aria-label={text.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <span style={{ width: `${progress * 100}%` }} />
          </div>
        </>
      )}
      {result && <p className="fishing-again">{text.again}</p>}
      </div>
    </>
  );
}
