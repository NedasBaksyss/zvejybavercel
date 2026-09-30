import User from "../models/user.js";
import { hashPassword, verifyPassword } from "../services/passwords.js";
import { startSession, endSession } from "../services/sessions.js";

const publicUser = (user) => ({ id: String(user._id), user: user.username, role: user.role });
const findUsername = (username) => User.findOne({ username }).collation({ locale: "en", strength: 2 });

export async function register(req, res) {
  const { username, password, email } = req.body;
  if (typeof username !== "string" || !/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
    return res.status(400).json({ error: "Username must contain 3–30 letters, numbers or underscores" });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Password must contain 8–128 characters" });
  }
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Enter a valid email address" });
  }
  try {
    const name = username.trim().toLowerCase();
    const mail = email.trim().toLowerCase();
    if (await findUsername(name) || await User.exists({ email: mail })) {
      return res.status(409).json({ error: "Username or email is already registered" });
    }
    const user = await User.create({ username: name, email: mail,
      passwordHash: await hashPassword(password), role: "user", lastLogin: new Date() });
    await startSession(req, res, user);
    res.status(201).json(publicUser(user));
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "Username or email is already registered" });
    console.error(error);
    res.status(500).json({ error: "Could not register account" });
  }
}

export async function login(req, res) {
  const { username, password } = req.body;
  if (typeof username !== "string" || username.length > 30 ||
    typeof password !== "string" || password.length > 128) {
    return res.status(400).json({ error: "Enter your username and password" });
  }
  try {
    const user = await findUsername(username.trim()).select("+passwordHash");
    const valid = await verifyPassword(password, user?.passwordHash);
    if (!valid || user.role === "guest") {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    user.lastLogin = new Date();
    await user.save();
    await startSession(req, res, user);
    res.json(publicUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not log in" });
  }
}

export function getSession(req, res) { res.json(publicUser(req.user)); }

export async function logout(req, res) {
  try {
    await endSession(req, res);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not log out. Please retry." });
  }
}
