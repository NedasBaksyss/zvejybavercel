const test = require("node:test");
const assert = require("node:assert/strict");
const { reservePlatform } = require("./lakePlatforms");

test("arrivals reserve distinct platforms, reject a full lake, and reuse a released spot", () => {
  const players = Object.fromEntries(["a", "b", "c", "d"].map((id) => [id, { id }]));
  const ids = ["a", "b", "c"].map((id) =>
    reservePlatform(players, players[id], "quiet-lake", "near-bank", 1000));
  assert.equal(new Set(ids).size, 3);
  assert.equal(reservePlatform(players, players.d, "quiet-lake", "near-bank", 1000), null);
  players.a.platformReservation = null;
  assert.equal(reservePlatform(players, players.d, "quiet-lake", "near-bank", 1000), "near-bank");
});

test("active anglers keep their spots; lakes and expired reservations are independent", () => {
  const players = {
    a: { id: "a", fishing: { lakeId: "quiet-lake", platformId: "near-bank" } },
    b: { id: "b" },
  };
  assert.equal(reservePlatform(players, players.b, "quiet-lake", "near-bank"), "west-bank");
  assert.equal(reservePlatform(players, players.b, "pine-lake", "near-bank"), "near-bank");
  players.a.fishing = null;
  players.a.platformReservation = { lakeId: "quiet-lake", platformId: "near-bank", expiresAt: 999 };
  assert.equal(reservePlatform(players, players.b, "quiet-lake", "near-bank", 1000), "near-bank");
  assert.equal(reservePlatform(players, players.b, "unknown", "near-bank"), null);
});

test("server platform IDs agree with every client lake", async () => {
  const { LAKE_PLATFORMS } = await import("../../client/src/map/lakePlatforms.js");
  for (const [lakeId, platforms] of Object.entries(LAKE_PLATFORMS)) {
    const players = {};
    for (const platform of platforms) {
      const player = { id: platform.id };
      players[player.id] = player;
      assert.equal(reservePlatform(players, player, lakeId, platform.id), platform.id);
    }
    players.extra = { id: "extra" };
    assert.equal(reservePlatform(players, players.extra, lakeId, "near-bank"), null);
  }
});
