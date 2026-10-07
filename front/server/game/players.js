const SPAWN = {
  x: 3475,
  y: 1210,
};

const players = new Map();

function createPlayer(id, name) {
  const player = {
    id,
    x: SPAWN.x,
    y: SPAWN.y,
    moving: false,
    direction: "down",
    name,
    fishing: null,
  };

  players.set(id, player);

  return player;
}

function getPlayer(id) {
  return players.get(id);
}

function removePlayer(id) {
  players.delete(id);
}

function getPlayers() {
  return Object.fromEntries(players);
}

module.exports = {
  createPlayer,
  getPlayer,
  removePlayer,
  getPlayers,
};
