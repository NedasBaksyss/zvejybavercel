export default function ProgressHud({ progress, language, onRetry }) {
  const lt = language === "LT";
  const profile = progress?.profile;
  const stats = profile?.stats;
  return (
    <aside className="atlas-progress" aria-label={lt ? "Žaidėjo progresas" : "Player progress"}
      title={profile ? `${profile.username} · ${lt ? "Pagauta" : "Fish caught"}: ${stats.totalFishCaught} · +${profile.xpPerCatch} XP` : undefined}>
      {stats && <>
        <strong>{lt ? "Lygis" : "Level"} {stats.level} · {stats.experience}/{profile.xpPerLevel} XP</strong>
        <progress value={stats.experience} max={profile.xpPerLevel} aria-label="XP" />
      </>}
      <span role="status">
        {progress?.status === "error"
          ? (lt ? "Neišsaugota" : "Not saved")
          : progress?.status === "saved"
            ? progress.leveledUp
              ? (lt ? "Pasiektas naujas lygis!" : "Level up!")
              : ""
            : (lt ? "Sinchronizuojama…" : "Syncing…")}
      </span>
      {progress?.status === "error" && <button type="button" onClick={onRetry}>
        {lt ? "Bandyti dar kartą" : "Retry save"}
      </button>}
    </aside>
  );
}
