import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { apiError, notFound } from "./middleware/apiErrors.js";
import progressRouter from "./routes/progress.js";
import User from "./models/user.js";
import Session from "./models/session.js";
import { hashPassword, verifyPassword } from "./services/passwords.js";
import { createAuthRateLimit } from "./middleware/auth.js";
process.env.JWT_SECRET ||= randomBytes(32).toString("hex");
const { default: authRouter } = await import("./routes/auth.js");

test("password hashes have unique salts and reject wrong or legacy placeholder passwords", async () => {
  const password = "My fishing password 123";
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.notEqual(first, second);
  assert.equal(first.includes(password), false);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("wrong", first), false);
  assert.equal(await verifyPassword(password, "..."), false);
});

test("auth attempts are rate limited", () => {
  const limit = createAuthRateLimit();
  let passed = 0;
  let status;
  const res = { set() {}, status(code) { status = code; return this; }, json() {} };
  for (let i = 0; i < 31; i++) limit({ ip: "test-client" }, res, () => passed++);
  assert.equal(passed, 30);
  assert.equal(status, 429);
});

test("registration, session persistence, account progress, expiry and logout", {
  skip: !process.env.MONGO_TEST_URI,
}, async () => {
  const dbName = `auth_test_${randomBytes(8).toString("hex")}`;
  let server;
  try {
    await mongoose.connect(process.env.MONGO_TEST_URI, { dbName });
    await Promise.all([User.init(), Session.init()]);
    const app = express();
    app.use(express.json(), cookieParser());
    app.use("/auth", authRouter);
    app.use("/progress", progressRouter);
    app.use(notFound);
    app.use(apiError);
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = async (path, body, cookie = "", header = true) => {
      const response = await fetch(base + path, {
        method: body ? "POST" : "GET",
        headers: { "Content-Type": "application/json", Cookie: cookie,
          ...(header ? { "X-Requested-With": "zvejyba" } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const cookies = response.headers.getSetCookie();
      return { status: response.status, cookies,
        cookie: cookies.at(-1)?.split(";")[0],
        data: response.status === 204 ? null : await response.json() };
    };
    const credentials = { username: "Angler_One", email: "angler@example.com", password: "Fishing password 123" };
    assert.equal((await request("/auth/user/login", credentials, "", false)).status, 403);
    assert.equal((await request("/auth/register", { ...credentials, password: "short" })).status, 400);
    assert.equal((await request("/auth/register", { ...credentials, username: { $ne: null } })).status, 400);
    const registered = await request("/auth/register", { ...credentials, role: "admin", stats: { level: 99 } });
    assert.equal(registered.status, 201);
    assert.equal(registered.data.user.role, "user");
    assert.equal(registered.data.user.passwordHash, undefined);
    assert.match(registered.cookies.at(-1), /HttpOnly/);
    assert.match(registered.cookies.at(-1), /SameSite=Strict/);
    const id = registered.data.user.id;
    const stored = await User.findById(id).select("+passwordHash");
    assert.equal(await verifyPassword(credentials.password, stored.passwordHash), true);
    assert.equal(stored.stats.level, 1);
    assert.equal((await User.findById(id)).passwordHash, undefined);
    assert.equal((await Session.findOne()).tokenHash.includes(registered.cookie.split("=")[1]), false);
    assert.equal((await request("/auth/session", null, registered.cookie)).data.user.id, id);
    assert.equal((await request("/auth/session")).status, 401);
    assert.equal((await request("/auth/register", { ...credentials, username: "ANGLER_ONE" })).status, 409);
    assert.equal((await request("/auth/register", { ...credentials, username: "another" })).status, 409);
    assert.equal((await request("/auth/user/login", { ...credentials, password: "wrong password" })).status, 401);
    assert.equal((await request("/auth/user/login", { ...credentials, username: "unknown" })).status, 401);

    const loggedIn = await request("/auth/user/login", { ...credentials, username: "ANGLER_ONE" }, registered.cookie);
    assert.equal(loggedIn.status, 200);
    assert.notEqual(loggedIn.cookie, registered.cookie);
    assert.equal((await request("/auth/session", null, registered.cookie)).status, 401);
    assert.equal((await request("/progress/account", { accountId: id })).status, 401);
    assert.equal((await request("/progress/account", { accountId: "someone-else" }, loggedIn.cookie)).status, 409);
    const catchId = randomUUID();
    const caught = await request("/progress/account/catches", { catchId, accountId: id }, loggedIn.cookie);
    assert.equal(caught.data.stats.experience, 25);
    const duplicate = await request("/progress/account/catches", { catchId, accountId: id }, loggedIn.cookie);
    assert.equal(duplicate.data.awardedXp, 0);
    assert.equal((await request("/progress/account", { accountId: id }, loggedIn.cookie)).data.stats.experience, 25);
    assert.equal((await request("/auth/logout", {}, loggedIn.cookie)).status, 204);
    assert.equal((await request("/auth/session", null, loggedIn.cookie)).status, 401);
    const next = await request("/auth/user/login", credentials);
    assert.equal((await request("/progress/account", { accountId: id }, next.cookie)).data.stats.experience, 25);
    await Session.updateMany({}, { expiresAt: new Date(0) });
    assert.equal((await request("/auth/session", null, next.cookie)).status, 401);
    // Accounts created before the auth merge retain their original scrypt hashes.
    await User.updateOne({ _id: id }, { passwordHash: await hashPassword(credentials.password) });
    const legacy = await request("/auth/user/login", credentials);
    assert.equal(legacy.status, 200);
    assert.equal((await request("/auth/session", null, legacy.cookie)).data.user.id, id);
    assert.equal((await request("/auth/missing", {})).status, 404);
    // The admin panel's JWT login and /me endpoint remain supported.
    await User.updateOne({ _id: id }, { role: "admin" });
    const admin = await request("/auth/admin/login", credentials);
    assert.equal(admin.status, 200);
    const me = await fetch(base + "/auth/me", { headers: { Authorization: `Bearer ${admin.data.token}` } });
    assert.equal(me.status, 200);
    assert.equal((await me.json()).user.id, id);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.name === dbName) await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
