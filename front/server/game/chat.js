const { randomUUID } = require("node:crypto");

const HISTORY_LIMIT = 50;
const MESSAGE_LIMIT = 200;
const COOLDOWN_MS = 750;

function cleanText(text) {
  return text.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, " ").trim();
}

function createChat(io, getPlayer) {
  const history = [];

  return function attachChat(socket) {
    let lastSent = -Infinity;
    socket.emit("chat:history", history.slice());

    socket.on("chat:send", (payload, acknowledge) => {
      const reply = typeof acknowledge === "function" ? acknowledge : () => {};
      const player = getPlayer(socket.id);
      if (!player) return reply({ ok: false, error: "disconnected" });
      if (typeof payload?.text !== "string" || payload.text.length > MESSAGE_LIMIT)
        return reply({ ok: false, error: "invalid" });
      const text = cleanText(payload.text);
      if (!text) return reply({ ok: false, error: "empty" });
      const now = Date.now();
      if (now - lastSent < COOLDOWN_MS)
        return reply({ ok: false, error: "cooldown" });
      lastSent = now;
      const name = typeof player.name === "string" ? cleanText(player.name).slice(0, 32) : "";
      const message = { id: randomUUID(), playerId: socket.id, name: name || "Guest", text, timestamp: now };
      history.push(message);
      if (history.length > HISTORY_LIMIT) history.shift();
      io.emit("chat:message", message);
      reply({ ok: true });
    });
  };
}

module.exports = { createChat };
