const platforms = {
  "quiet-lake": ["near-bank", "west-bank", "east-bank"],
  "pine-lake": ["near-bank", "cabin-bank", "east-bank"],
  "reed-lake": ["near-bank", "west-reeds", "east-reeds"],
  "meadow-lake": ["near-bank", "cabin-bank", "flower-bank"],
  "highland-lake": ["near-bank", "west-rocks", "east-rocks"],
  "sunset-lake": ["near-bank", "west-bank", "east-bank"],
};

// Reservations are synchronous so two simultaneous arrivals cannot take one spot.
function reservePlatform(players, player, lakeId, preferredId, now = Date.now()) {
  const choices = platforms[lakeId];
  if (!choices) return null;
  const occupied = new Set();
  for (const other of Object.values(players)) {
    if (other.id === player.id) continue;
    const spot = other.fishing ||
      (other.platformReservation?.expiresAt > now ? other.platformReservation : null);
    if (spot?.lakeId === lakeId) occupied.add(spot.platformId);
  }
  const platformId = choices.includes(preferredId) && !occupied.has(preferredId)
    ? preferredId : choices.find((id) => !occupied.has(id));
  if (!platformId) return null;
  player.platformReservation = { lakeId, platformId, expiresAt: now + 10000 };
  return platformId;
}

module.exports = { reservePlatform };
