import { createHash } from "node:crypto";

export function requireGuestProfile(req, res, next) {
  const token = req.get("Authorization")?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!token) return res.status(401).json({ error: "Guest profile key is required" });
  req.guestTokenHash = createHash("sha256").update(token).digest("hex");
  next();
}
