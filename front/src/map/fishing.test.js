import { test } from "node:test";
import assert from "node:assert/strict";
import { castLine, hookFish, updateFishing, BITE_WINDOW, CONTROL_WIDTH } from "./fishing.js";

const keys = new Set();
const species = ["pike", "perch"];
function advance(fishing, seconds, held = keys, random = () => 0.5) {
  for (let i = 0; i < Math.round(seconds * 100); i++)
    updateFishing(fishing, 0.01, held, species, random);
}

test("bite odds start at 20% after 3 seconds and rise on timed checks", () => {
  const fishing = castLine({ x: 600, y: 400 });
  updateFishing(fishing, 2.99, keys, species, () => 0);
  assert.equal(fishing.phase, "waiting");
  updateFishing(fishing, 0.01, keys, species, () => 0.21);
  assert.equal(fishing.chance, 0.2);
  assert.equal(fishing.phase, "waiting");
  updateFishing(fishing, 3, keys, species, () => 0.39);
  assert.equal(fishing.phase, "bite");
  assert.equal(fishing.chance, 0.4);
  assert.ok(species.includes(fishing.fish));
});

test("a cast gets a bite by the fifth check, even with unlucky rolls", () => {
  const fishing = castLine();
  for (let i = 0; i < 5; i++) updateFishing(fishing, 3, keys, species, () => 0.999);
  assert.equal(fishing.phase, "bite");
  assert.equal(fishing.chance, 1);
});

test("missing the hook window loses the fish and automatically permits another cast", () => {
  const fishing = castLine();
  updateFishing(fishing, 3, keys, species, () => 0);
  assert.equal(updateFishing(fishing, BITE_WINDOW, keys, species), "lost");
  assert.equal(fishing.cast, false);
  assert.equal(hookFish(fishing), false);
  updateFishing(fishing, 3, keys, species);
  assert.equal(fishing.phase, "idle");
});

test("tracking fills progress and emits a catch only once", () => {
  const fishing = castLine();
  updateFishing(fishing, 3, keys, species, () => 0);
  assert.equal(hookFish(fishing), true);
  assert.equal(hookFish(fishing), false);
  advance(fishing, 5.1);
  assert.equal(fishing.phase, "caught");
  assert.equal(fishing.progress, 1);
  assert.equal(fishing.cast, false);
  assert.equal(updateFishing(fishing, 0.01, keys, species), null);
});

test("failing to follow drains progress; controls stay within track bounds", () => {
  const fishing = castLine();
  updateFishing(fishing, 3, keys, species, () => 0);
  hookFish(fishing);
  advance(fishing, 4, new Set(["KeyD"]), () => 0);
  assert.equal(fishing.phase, "lost");
  assert.ok(fishing.control <= 1 - CONTROL_WIDTH / 2);
  assert.ok(fishing.control >= CONTROL_WIDTH / 2);
});

test("zero active time does not advance bite timers or drain a fighting fish", () => {
  const fishing = castLine();
  updateFishing(fishing, 0, keys, species, () => 0);
  assert.equal(fishing.elapsed, 0);
  updateFishing(fishing, 3, keys, species, () => 0);
  hookFish(fishing);
  const progress = fishing.progress;
  updateFishing(fishing, 0, new Set(["KeyA"]), species);
  assert.equal(fishing.progress, progress);
  assert.equal(fishing.control, 0.5);
});
