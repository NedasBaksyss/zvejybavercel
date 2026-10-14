const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { reservePlatform } = require("./game/lakePlatforms");

const {
  createPlayer,
  getPlayer,
  getPlayers,
  removePlayer,
} = require("./game/players");

const app = express();

app.use(cors());

app.get("/multiplayer/health", (req, res) => {
  res.json({ service: "multiplayer", status: "ok" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || ["http://localhost:5173", "http://localhost:5700"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);
  
  const name = socket.handshake.auth.name

  const player = createPlayer(socket.id, name);

  // Tell the new player where they spawned.
  socket.emit("player:spawn", player);

  // Give the new player everyone already online.
  socket.emit("players:init", getPlayers());

  // Tell everyone else about the new player.
  socket.broadcast.emit("player:joined", player);

  socket.on("player:move", (position) => {
    const player = getPlayer(socket.id);

    if (!player) return;

    player.x = position.x;
    player.y = position.y;
    player.moving = Boolean(position.moving);
    player.direction = position.direction || "down";

    socket.broadcast.emit("player:moved", {
      id: player.id,
      x: player.x,
      y: player.y,
      moving: player.moving,
      direction: player.direction,
      name: player.name,
    });
  });

  socket.on("player:reserve-platform", (request, reply) => {
    if (typeof reply !== "function") return;
    const player = getPlayer(socket.id);
    if (!player) return reply({ error: "unavailable" });
    const platformId = reservePlatform(getPlayers(), player, request?.lakeId, request?.platformId);
    reply(platformId ? { platformId } : { error: "full" });
  });

  socket.on("player:fishing", (fishing) => {
  const player = getPlayer(socket.id);

  if (!player) return;

  const presence = fishing?.fishing || null;
  if (presence && player.platformReservation && (
    presence.lakeId !== player.platformReservation.lakeId ||
    presence.platformId !== player.platformReservation.platformId
  )) return;
  player.fishing = presence;
  if (!presence) player.platformReservation = null;

  socket.broadcast.emit("player:fishing", {
    id: player.id,
    name: player.name,
    fishing: player.fishing,
  });
});


  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    removePlayer(socket.id);

    io.emit("player:left", socket.id);
  });
});

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT || 3001);
  server.listen(port, () => console.log(`Multiplayer server listening on port ${port}`));
}

module.exports = server;
