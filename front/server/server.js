const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const {
  createPlayer,
  getPlayer,
  getPlayers,
  removePlayer,
} = require("./game/players");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  const player = createPlayer(socket.id);

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


  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    removePlayer(socket.id);

    io.emit("player:left", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
