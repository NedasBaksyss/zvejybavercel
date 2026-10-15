import { test } from "node:test";
import assert from "node:assert/strict";
import { createLakeSession } from "./createLakeSession.js";

function setup() {
  const handlers = new Map();
  const sent = [];
  const requests = [];
  const runtime = { state: { enteringLocation: false, destination: null }, stopped: false };
  const socket = {
    connected: true,
    on: (event, handler) => handlers.set(event, handler),
    off: (event) => handlers.delete(event),
    emit: (...args) => sent.push(args),
    timeout: () => ({ emit: (event, body, callback) => requests.push({ event, body, callback }) }),
  };
  const applied = [];
  const session = createLakeSession({ socket, runtime, publish() {},
    applySpot: (spot) => applied.push(spot),
    leaveLocation: () => { runtime.state.destination = null; },
  });
  return { socket, runtime, sent, requests, applied, session, handlers };
}

test("entry waits for a reservation and blocks duplicate clicks", () => {
  const { session, requests, applied, runtime } = setup();
  assert.equal(session.join("quiet-lake", "near-bank"), true);
  assert.equal(runtime.state.enteringLocation, true);
  assert.equal(session.join("quiet-lake", "near-bank"), false);
  assert.equal(applied.length, 0);
  const spot = { platformId: "near-bank", spotIndex: 1 };
  requests[0].callback(null, { ok: true, fishing: spot });
  assert.deepEqual(applied, [spot]);
  assert.equal(runtime.state.enteringLocation, false);
});

test("cancelled joins ignore late replies and release pending reservations", () => {
  const { session, requests, sent, applied } = setup();
  session.join("quiet-lake");
  session.cancelEntry();
  requests[0].callback(null, { ok: true, fishing: { spotIndex: 0 } });
  assert.deepEqual(applied, []);
  assert.deepEqual(sent.at(-1), ["player:fishing", { fishing: null }]);
});

test("timeouts and full lakes show errors without entering", () => {
  for (const timeout of [false, true]) {
    const { session, requests, runtime, applied, sent } = setup();
    session.join("quiet-lake");
    requests[0].callback(timeout, { ok: false, error: "full" });
    assert.equal(runtime.state.locationError, timeout ? "timeout" : "full");
    assert.deepEqual(applied, []);
    assert.equal(runtime.state.destination, null);
    assert.deepEqual(sent.at(-1), ["player:fishing", { fishing: null }]);
  }
});

test("reconnection reacquires a spot and cleanup removes connection listeners", () => {
  const { session, socket, runtime, handlers, applied, requests } = setup();
  runtime.state.destination = { id: "quiet-lake", type: "lake" };
  runtime.state.platformId = "near-bank";
  socket.connected = false;
  handlers.get("disconnect")();
  assert.deepEqual(applied, [null]);
  assert.equal(session.join("quiet-lake"), false);
  assert.equal(requests.length, 0);
  socket.connected = true;
  handlers.get("connect")();
  assert.deepEqual(requests[0].body, { lakeId: "quiet-lake", platformId: "near-bank" });
  requests[0].callback(null, { ok: true, fishing: { spotIndex: 1 } });
  assert.equal(applied.at(-1).spotIndex, 1);
  session.dispose();
  assert.equal(handlers.size, 0);
});
