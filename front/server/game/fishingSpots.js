// Platform IDs match the lake layouts in the game client. Each bridge has two seats.
const LAKE_PLATFORMS = {
  "quiet-lake": ["near-bank", "west-bank", "east-bank"],
  "pine-lake": ["near-bank", "cabin-bank", "east-bank"],
  "reed-lake": ["near-bank", "west-reeds", "east-reeds"],
  "meadow-lake": ["near-bank", "cabin-bank", "flower-bank"],
  "highland-lake": ["near-bank", "west-rocks", "east-rocks"],
  "sunset-lake": ["near-bank", "west-bank", "east-bank"],
};

function createFishingSpots(getPlayer, getPlayers) {
  return function attachFishingSpots(socket) {
    function broadcast(player) {
      socket.broadcast.emit("player:fishing", {
        id: player.id, name: player.name, fishing: player.fishing,
      });
    }

    socket.on("lake:join", (request, acknowledge) => {
      const reply = typeof acknowledge === "function" ? acknowledge : () => {};
      const player = getPlayer(socket.id);
      const platforms = LAKE_PLATFORMS[request?.lakeId];
      if (!player || !Array.isArray(platforms)) return reply({ ok: false, error: "invalid" });
      // Repeated requests and casting updates must never move an existing occupant.
      if (player.fishing?.lakeId === request.lakeId)
        return reply({ ok: true, fishing: player.fishing });
      const preferred = platforms.includes(request.platformId) ? request.platformId : platforms[0];
      const ordered = [preferred, ...platforms.filter((id) => id !== preferred)];
      const occupied = new Set(Object.values(getPlayers())
        .filter((other) => other.id !== socket.id && other.fishing?.lakeId === request.lakeId)
        .map((other) => `${other.fishing.platformId}:${other.fishing.spotIndex}`));
      for (const platformId of ordered) {
        for (let spotIndex = 0; spotIndex < 2; spotIndex++) {
          if (occupied.has(`${platformId}:${spotIndex}`)) continue;
          // Reservation happens synchronously before replying, including simultaneous joins.
          player.fishing = { lakeId: request.lakeId, platformId, spotIndex, active: false, target: null };
          broadcast(player);
          return reply({ ok: true, fishing: player.fishing });
        }
      }
      reply({ ok: false, error: "full" });
    });

    socket.on("player:fishing", (payload) => {
      const player = getPlayer(socket.id);
      if (!player) return;
      if (payload?.fishing === null) {
        player.fishing = null;
        broadcast(player);
        return;
      }
      const fishing = payload?.fishing;
      if (!player.fishing || !fishing || fishing.lakeId !== player.fishing.lakeId) return;
      const target = fishing.target;
      const validTarget = Number.isFinite(target?.x) && Number.isFinite(target?.y) &&
        target.x >= 0 && target.x <= 960 && target.y >= 0 && target.y <= 540;
      player.fishing = {
        ...player.fishing,
        active: fishing.active === true && validTarget,
        target: validTarget ? { x: target.x, y: target.y } : null,
      };
      broadcast(player);
    });
  };
}

module.exports = { createFishingSpots, LAKE_PLATFORMS };
