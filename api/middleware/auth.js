import Session from "../models/session.js";
import User from "../models/user.js";
import { COOKIE_NAME, tokenHash } from "../services/sessions.js";

// Cross-origin forms cannot set this header; the API does not enable CORS.
export function requireAuthRequest(req, res, next) {
  if (req.get("X-Requested-With") !== "zvejyba" || !req.is("application/json")) {
    return res.status(403).json({ error: "Invalid request origin" });
  }
  next();
}

export async function requireSession(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    const session = typeof token === "string" && /^[a-f0-9]{64}$/.test(token)
      ? await Session.findOne({ tokenHash: tokenHash(token), expiresAt: { $gt: new Date() } }) : null;
    const user = session ? await User.findById(session.userId) : null;
    if (!user || user.role === "guest") return res.status(401).json({ error: "Please log in again" });
    req.user = user;
    res.set("Cache-Control", "no-store");
    next();
  } catch (error) {
    console.error(error);
    res.status(503).json({ error: "Could not check session" });
  }
}

export function requireAccountMatch(req, res, next) {
  if (req.body.accountId !== String(req.user._id)) {
    return res.status(409).json({ error: "Account changed. Please log in again." });
  }
  next();
}

export function createAuthRateLimit() {
  const attempts = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, entry] of attempts) if (entry.expires <= now) attempts.delete(key);
    const entry = attempts.get(req.ip) || { count: 0, expires: now + 15 * 60 * 1000 };
    if (++entry.count > 30 || (!attempts.has(req.ip) && attempts.size >= 10000)) {
      res.set("Retry-After", String(Math.ceil((entry.expires - now) / 1000)));
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }
    attempts.set(req.ip, entry);
    next();
  };
}
