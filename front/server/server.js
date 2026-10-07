const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const players = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Create the player
  players[socket.id] = {
    id: socket.id,
    x: 100,
    y: 100,
  };

  // Send all existing players to the new player
  socket.emit("players:init", players);

  // Tell everyone else about the new player
  socket.broadcast.emit("player:joined", players[socket.id]);

  socket.on("player:move", (position) => {
    const player = players[socket.id];

    if (!player) return;

    player.x = position.x;
    player.y = position.y;

    // Send updated position to everyone except sender
    socket.broadcast.emit("player:moved", {
      id: socket.id,
      x: player.x,
      y: player.y,
    });
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    delete players[socket.id];

    io.emit("player:left", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
