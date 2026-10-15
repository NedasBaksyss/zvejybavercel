const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createChat } = require("./chat");

function setup() {
  const broadcasts = [];
  const players = new Map();
  const attach = createChat({ emit: (...args) => broadcasts.push(args) }, (id) => players.get(id));
  function join(id, name) {
    const received = [];
    const handlers = {};
    players.set(id, { name });
    attach({ id, emit: (...args) => received.push(args), on: (event, fn) => { handlers[event] = fn; } });
    return { received, send(payload) { let reply; handlers["chat:send"](payload, (value) => { reply = value; }); return reply; } };
  }
  return { broadcasts, players, join };
}

test("broadcasts use the connected player's name and include recent history", () => {
  const { broadcasts, join } = setup();
  const first = join("one", "Angler");
  assert.deepEqual(first.send({ text: " Hello! ", name: "Spoofed" }), { ok: true });
  const [event, message] = broadcasts[0];
  assert.equal(event, "chat:message");
  assert.equal(message.name, "Angler");
  assert.equal(message.text, "Hello!");
  assert.equal(message.playerId, "one");
  assert.ok(message.id);
  assert.equal(typeof message.timestamp, "number");
  assert.deepEqual(join("two", "Guest").received, [["chat:history", [message]]]);
});

test("rejects malformed, empty, oversized and rapid messages without broadcasting", () => {
  const { broadcasts, players, join } = setup();
  const client = join("one", "Angler");
  for (const payload of [null, {}, { text: 42 }, { text: "x".repeat(201) }])
    assert.equal(client.send(payload).error, "invalid");
  assert.equal(client.send({ text: "\n\t " }).error, "empty");
  assert.equal(client.send({ text: "Valid" }).ok, true);
  assert.equal(client.send({ text: "Too soon" }).error, "cooldown");
  players.delete("one");
  assert.equal(client.send({ text: "Left" }).error, "disconnected");
  assert.equal(broadcasts.length, 1);
});

test("history keeps only the newest 50 messages and sanitizes control characters", (t) => {
  let now = 1000;
  t.mock.method(Date, "now", () => now);
  const { broadcasts, join } = setup();
  const client = join("one", "\u202eAngler\n");
  for (let i = 0; i < 55; i++) {
    assert.equal(client.send({ text: `Message ${i}\n` }).ok, true);
    now += 750;
  }
  const history = join("two", "Guest").received[0][1];
  assert.equal(history.length, 50);
  assert.equal(history[0].text, "Message 5");
  assert.equal(history[49].text, "Message 54");
  assert.equal(history[0].name, "Angler");
  assert.equal(broadcasts.length, 55);
});
