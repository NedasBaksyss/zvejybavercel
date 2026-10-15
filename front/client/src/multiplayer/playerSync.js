export function createPlayerSync(socket, runtime, publish) {
  function handleSpawn(player) {
    runtime.state.player = {
      x: player.x,
      y: player.y,
    };

    runtime.state.playerName = player.name;

    runtime.state.camera = {
      x: player.x,
      y: player.y,
    };

    publish(true);
  }

  function handleInit(players) {
    runtime.remotePlayers.clear();

    for (const player of Object.values(players)) {
      if (player.id === socket.id) continue;

      runtime.remotePlayers.set(player.id, {
        ...player,
        fishing: player.fishing || null,
      });
    }

    publish(true);
  }

  function handleJoined(player) {
    if (player.id === socket.id) return;

    runtime.remotePlayers.set(player.id, {
      ...player,
      fishing: player.fishing || null,
    });

    publish(true);
  }

  function handleMoved(player) {
    const existing = runtime.remotePlayers.get(player.id);

    if (existing) {
      existing.x = player.x;
      existing.y = player.y;
      existing.moving = player.moving;
      existing.direction = player.direction;
      existing.name = player.name;
    } else {
      runtime.remotePlayers.set(player.id, {
        ...player,
        fishing: player.fishing || null,
      });
    }

    publish(true);
  }

  function handleFishing(player) {
    if (!player?.id || player.id === socket.id) return;

    const existing = runtime.remotePlayers.get(player.id) || {};

    runtime.remotePlayers.set(player.id, {
      ...existing,
      ...player,
      fishing:
        player.fishing === undefined
          ? existing.fishing ?? null
          : player.fishing,
    });

    publish(true);
  }

  function handleLeft(id) {
    runtime.remotePlayers.delete(id);
    publish(true);
  }

  socket.on("player:spawn", handleSpawn);
  socket.on("players:init", handleInit);
  socket.on("player:joined", handleJoined);
  socket.on("player:moved", handleMoved);
  socket.on("player:fishing", handleFishing);
  socket.on("player:left", handleLeft);

  return {
    dispose() {
      socket.off("player:spawn", handleSpawn);
      socket.off("players:init", handleInit);
      socket.off("player:joined", handleJoined);
      socket.off("player:moved", handleMoved);
      socket.off("player:fishing", handleFishing);
      socket.off("player:left", handleLeft);
    },
  };
}
