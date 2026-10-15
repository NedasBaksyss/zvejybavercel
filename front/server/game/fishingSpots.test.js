const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createFishingSpots, LAKE_PLATFORMS } = require("./fishingSpots");

function setup() {
  const players = new Map();
  const updates = [];
  const attach = createFishingSpots((id) => players.get(id), () => Object.fromEntries(players));
  function connect(id) {
    const handlers = {};
    players.set(id, { id, name: id, fishing: null });
    attach({ id, on: (event, handler) => { handlers[event] = handler; },
      broadcast: { emit: (...args) => updates.push(args) } });
    return {
      join(lakeId = "quiet-lake", platformId = "near-bank") {
        let result;
        handlers["lake:join"]({ lakeId, platformId }, (response) => { result = response; });
        return result;
      },
      update(fishing) { handlers["player:fishing"]({ fishing }); },
      disconnect() { players.delete(id); },
      get fishing() { return players.get(id).fishing; },
    };
  }
  return { connect, updates };
}

test("two players share separate seats; a third falls back to another bridge", () => {
  const { connect } = setup();
  const first = connect("one").join().fishing;
  const second = connect("two").join().fishing;
  const third = connect("three").join().fishing;
  assert.equal(first.platformId, "near-bank");
  assert.equal(second.platformId, "near-bank");
  assert.deepEqual([first.spotIndex, second.spotIndex], [0, 1]);
  assert.equal(third.platformId, "west-bank");
});

test("simultaneous joins reserve six unique seats and reject overflow", async () => {
  const { connect } = setup();
  const clients = Array.from({ length: 7 }, (_, i) => connect(`player${i}`));
  const results = await Promise.all(clients.map((client) => Promise.resolve().then(() => client.join())));
  const seats = results.slice(0, 6).map(({ fishing }) => `${fishing.platformId}:${fishing.spotIndex}`);
  assert.equal(new Set(seats).size, 6);
  assert.deepEqual(results[6], { ok: false, error: "full" });
  assert.equal(clients[6].fishing, null);
});

test("leaving or disconnecting frees a seat without moving existing players", () => {
  const { connect } = setup();
  const first = connect("one");
  const second = connect("two");
  first.join();
  const occupied = second.join().fishing;
  first.update(null);
  assert.equal(connect("three").join().fishing.spotIndex, 0);
  assert.deepEqual(second.join().fishing, occupied);
  second.disconnect();
  assert.equal(connect("four").join().fishing.spotIndex, 1);
});

test("lake occupancy is separate and fishing updates cannot change reserved seats", () => {
  const { connect, updates } = setup();
  const client = connect("one");
  client.update({ lakeId: "quiet-lake", active: true });
  assert.equal(client.fishing, null);
  const reserved = client.join().fishing;
  client.update({ lakeId: "quiet-lake", platformId: "east-bank", spotIndex: 1,
    x: 999, active: true, target: { x: 550, y: 390 } });
  assert.equal(client.fishing.platformId, reserved.platformId);
  assert.equal(client.fishing.spotIndex, reserved.spotIndex);
  assert.equal(client.fishing.active, true);
  assert.equal(client.fishing.x, undefined);
  assert.equal(connect("two").join("pine-lake").fishing.spotIndex, 0);
  assert.equal(updates.at(-1)[0], "player:fishing");
  assert.deepEqual(client.join("missing-lake"), { ok: false, error: "invalid" });
});

test("every server bridge has two separated positions inside the matching client layout", async () => {
  const { LAKE_PLATFORMS: layouts, getLakeFishingSpot } = await import("../../client/src/map/lakePlatforms.js");
  assert.deepEqual(Object.keys(LAKE_PLATFORMS).sort(), Object.keys(layouts).sort());
  for (const [lakeId, ids] of Object.entries(LAKE_PLATFORMS)) {
    assert.deepEqual(ids, layouts[lakeId].map((platform) => platform.id));
    for (const platform of layouts[lakeId]) {
      const first = getLakeFishingSpot(lakeId, platform.id, 0);
      const second = getLakeFishingSpot(lakeId, platform.id, 1);
      assert.ok(second.angler.x - first.angler.x >= 65);
      assert.ok(first.angler.x > platform.x + 15);
      assert.ok(second.angler.x < platform.x + platform.width - 15);
      assert.equal(first.angler.y, second.angler.y);
      assert.equal(second.rod.tipX - first.rod.tipX, second.angler.x - first.angler.x);
    }
  }
});

test("all fishing phases are broadcast without losing the reserved spot", () => {
  const { connect, updates } = setup();
  const client = connect("angler");
  const reserved = client.join().fishing;
  for (const phase of ["waiting", "bite", "fighting", "caught", "lost", "idle"]) {
    client.update({ lakeId: "quiet-lake", phase, active: ["waiting", "bite", "fighting"].includes(phase),
      target: { x: 550, y: 390 }, platformId: "east-bank", spotIndex: 1 });
    const message = updates.at(-1)[1].fishing;
    assert.equal(message.phase, phase);
    assert.equal(message.platformId, reserved.platformId);
    assert.equal(message.spotIndex, reserved.spotIndex);
  }
  client.update({ lakeId: "quiet-lake", phase: "invalid" });
  assert.equal(client.fishing.phase, "idle");
  const second = connect("second").join().fishing;
  assert.equal(second.platformId, reserved.platformId);
  assert.equal(second.spotIndex, 1);
});
