import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import express from "express";
import mongoose from "mongoose";
import progressRouter from "./routes/progress.js";
import jwt from "jsonwebtoken";
import User from "./models/user.js";
import { validateStats } from "./progression.js";
process.env.JWT_SECRET ||= randomBytes(32).toString("hex");
const { default: usersRouter } = await import("./routes/users.js");

test("admin stats require whole numbers and XP within the current level", () => {
  for (const input of [{ level: 0 }, { experience: 100 }, { experience: -1 },
    { coins: 0.5 }, { level: "2" }, { totalFishCaught: null }, {}]) {
    assert.throws(() => validateStats(input));
  }
  assert.deepEqual(validateStats({ level: 4, experience: 75 }),
    { "stats.level": 4, "stats.experience": 75 });
});

test("database persistence, guest isolation, concurrent catches and admin edits", {
  skip: !process.env.MONGO_TEST_URI,
}, async () => {
  // Only this disposable database is removed; never connect tests to the game database.
  const dbName = `progress_test_${randomBytes(8).toString("hex")}`;
  let server;
  try {
    await mongoose.connect(process.env.MONGO_TEST_URI, { dbName });
    await User.init();
    const app = express();
    app.use(express.json());
    app.use("/progress", progressRouter);
    app.use("/users", usersRouter);
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const token = randomBytes(32).toString("hex");
    async function request(path, body, auth = token, method = "POST") {
      const response = await fetch(base + path, { method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth}` },
        ...(method === "GET" ? {} : { body: JSON.stringify(body) }),
      });
      return { status: response.status, data: await response.json() };
    }
    assert.equal((await request("/progress/guest", {}, "wrong")).status, 401);
    const first = (await request("/progress/guest", {})).data;
    assert.equal(first.stats.level, 1);
    assert.equal(first.stats.experience, 0);
    assert.equal((await request("/progress/guest", {})).data.id, first.id);
    const other = (await request("/progress/guest", {}, randomBytes(32).toString("hex"))).data;
    assert.notEqual(other.id, first.id);

    const receipt = randomUUID();
    const duplicate = await Promise.all(Array.from({ length: 4 }, () =>
      request("/progress/catches", { catchId: receipt, experience: 99999 })));
    assert.equal(duplicate.reduce((sum, result) => sum + result.data.awardedXp, 0), 25);
    await Promise.all(Array.from({ length: 11 }, () =>
      request("/progress/catches", { catchId: randomUUID() })));
    const saved = (await request("/progress/guest", {})).data;
    assert.deepEqual(saved.stats, { level: 4, experience: 0, totalFishCaught: 12, coins: 0 });
    const raw = await User.findById(first.id).lean();
    assert.equal(raw.stats.level, 4);
    assert.equal(raw.guestTokenHash, undefined);
    assert.equal(raw.catchReceipts, undefined);
    assert.equal((await User.findById(other.id)).stats.totalFishCaught, 0);

    const admin = await User.create({ username: "stats_admin", email: "stats@example.test", role: "admin" });
    const adminToken = jwt.sign({ id: String(admin._id) }, process.env.JWT_SECRET);
    assert.equal((await request(`/users/${first.id}/stats`, { experience: 100 }, adminToken, "PATCH")).status, 400);
    assert.equal((await request(`/users/${first.id}/stats`,
      { level: 7, experience: 90, coins: 42 }, adminToken, "PATCH")).status, 200);
    const leveled = (await request("/progress/catches", { catchId: randomUUID() })).data;
    assert.equal(leveled.stats.level, 8);
    assert.equal(leveled.stats.experience, 15);
    assert.equal(leveled.stats.coins, 42);
    assert.equal(leveled.stats.totalFishCaught, 13);
    assert.deepEqual((await request("/progress/guest", {})).data.stats, leveled.stats);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.name === dbName) await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
