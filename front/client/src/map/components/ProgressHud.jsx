export default function ProgressHud({ progress, language, onRetry }) {
  const lt = language === "LT";
  const profile = progress?.profile;
  const stats = profile?.stats;
  const award = progress?.lastAward;
  return (
    <aside
      className="atlas-progress"
      aria-label={lt ? "Žaidėjo progresas" : "Player progress"}
      title={
        profile
          ? `${profile.username} · ${lt ? "Pagauta" : "Fish caught"}: ${stats.totalFishCaught} · +${profile.xpPerCatch} XP`
          : undefined
      }
    >
      {stats && (
        <>
          <div className="progress-row">
            <strong className="xp-level" aria-label={`${lt ? "Lygis" : "Level"} ${stats.level}`}>
              {stats.level}
            </strong>
            <div
              className="xp-track"
              role="progressbar"
              aria-label="XP"
              aria-valuemin={0}
              aria-valuemax={profile.xpPerLevel}
              aria-valuenow={stats.experience}
              aria-valuetext={`${stats.experience} / ${profile.xpPerLevel} XP`}
            >
              <span
                className="xp-fill"
                style={{
                  width: `${Math.min(100, Math.max(0, (stats.experience / profile.xpPerLevel) * 100))}%`,
                }}
              />
              <span className="xp-segments" aria-hidden="true" />
              <span className="xp-value" aria-hidden="true">
                {stats.experience}/{profile.xpPerLevel} XP
              </span>
            </div>
          </div>
          <div className="cash-row" aria-label={lt ? "Pinigai" : "Cash"}>
            <span className="cash-icon">$</span>
            <strong className="cash-amount">{stats.coins ?? 0}</strong>
            <span className="cash-label">{lt ? "pinigų" : "cash"}</span>
          </div>
        </>
      )}
      <span role="status" className="progress-status">
        {progress?.status === "error"
          ? lt
            ? "Neišsaugota"
            : "Not saved"
          : progress?.status === "saved"
            ? progress.leveledUp
              ? lt
                ? `Naujas lygis! +${profile?.coinsPerLevel ?? 50} pinigų`
                : `Level up! +${profile?.coinsPerLevel ?? 50} cash`
              : award?.coins
                ? lt
                  ? `+${award.coins} pinigų`
                  : `+${award.coins} cash`
                : ""
            : lt
              ? "Sinchronizuojama…"
              : "Syncing…"}
      </span>
      {progress?.status === "error" && (
        <button type="button" onClick={onRetry}>
          {lt ? "Bandyti dar kartą" : "Retry save"}
        </button>
      )}
    </aside>
  );
}