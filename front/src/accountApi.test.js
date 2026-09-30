import test from "node:test";
import assert from "node:assert/strict";
import { createAccountApi } from "./accountApi.js";

test("login uses the current endpoint and exposes the account ID to progression", async () => {
  const api = createAccountApi({ request: async (url) => {
    assert.equal(url, "/api/auth/user/login");
    return new Response(JSON.stringify({ user: { id: "player-id", username: "nedas" } }),
      { headers: { "Content-Type": "application/json" } });
  } });
  const player = await api.login("nedas", "password");
  assert.equal(player.id, "player-id");
  assert.equal(player.user.username, "nedas");
});

test("HTML error responses produce a useful error instead of a JSON parsing error", async () => {
  const api = createAccountApi({ request: async () => new Response("<!DOCTYPE html>",
    { status: 404, headers: { "Content-Type": "text/html" } }) });
  await assert.rejects(api.login("nedas", "password"), /HTTP 404.*rebuild the API/);
});
