import test from "node:test";
import assert from "node:assert/strict";
import { createGuestProgress } from "./guestProgress.js";

test("account queues stay separate and an expired session retains its pending catch", async () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  let expired = false;
  const request = async (url, options) => {
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(options.credentials, "same-origin");
    assert.equal(JSON.parse(options.body).accountId, "account-one");
    return { ok: false, status: 401 };
  };
  const progress = createGuestProgress({ accountId: "account-one", storage, request,
    onChange() {}, onSessionExpired() { expired = true; } });
  await progress.recordCatch();
  assert.equal(expired, true);
  assert.equal(JSON.parse(values.get("zvejyba.account-progress.account-one")).pending.length, 1);
  assert.equal(values.has("zvejyba.guest-progress.v1"), false);
  assert.equal(values.has("zvejyba.account-progress.account-two"), false);
  progress.stop();
});

test("an interrupted catch save survives reload and retries the same receipt", async () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  const receipts = new Set();
  const attempted = [];
  let fail = true;
  let latest;
  const request = async (url, options) => {
    if (url.endsWith("catches")) {
      const { catchId } = JSON.parse(options.body);
      attempted.push(catchId);
      receipts.add(catchId);
      // Simulate a saved catch whose response never reached the browser.
      if (fail) throw new Error("connection lost");
    }
    return { ok: true, json: async () => ({ username: "guest-test",
      stats: { level: 1 + Math.floor(receipts.size / 4), experience: receipts.size * 25 % 100,
        totalFishCaught: receipts.size }, xpPerLevel: 100, xpPerCatch: 25 }) };
  };
  let progress = createGuestProgress({ storage, request, onChange: (state) => { latest = state; } });
  await progress.recordCatch();
  assert.equal(latest.status, "error");
  assert.equal(latest.pending, 1);
  progress.stop();
  fail = false;
  progress = createGuestProgress({ storage, request, onChange: (state) => { latest = state; } });
  await progress.refresh();
  assert.equal(attempted[0], attempted[1]);
  assert.equal(latest.profile.stats.totalFishCaught, 1);
  assert.equal(latest.pending, 0);
  await Promise.all([progress.recordCatch(), progress.recordCatch(), progress.recordCatch()]);
  assert.equal(latest.profile.stats.level, 2);
  assert.equal(latest.profile.stats.experience, 0);
  assert.equal(latest.leveledUp, true);
  progress.stop();
});
