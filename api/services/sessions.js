import { createHash, randomBytes } from "node:crypto";
import Session from "../models/session.js";

export const COOKIE_NAME = "zvejyba_session";
const lifetime = 7 * 24 * 60 * 60 * 1000;
const cookieOptions = {
  httpOnly: true, sameSite: "strict", path: "/",
  secure: process.env.NODE_ENV === "production",
};
export const tokenHash = (token) => createHash("sha256").update(token).digest("hex");

export async function endSession(req, res) {
  const token = req.cookies?.[COOKIE_NAME];
  if (typeof token === "string") await Session.deleteOne({ tokenHash: tokenHash(token) });
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

export async function startSession(req, res, user) {
  await endSession(req, res);
  const token = randomBytes(32).toString("hex");
  await Session.create({ tokenHash: tokenHash(token), userId: user._id,
    expiresAt: new Date(Date.now() + lifetime) });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: lifetime });
}
