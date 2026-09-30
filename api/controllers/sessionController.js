import { endSession } from "../services/sessions.js";

export function getGameSession(req, res) {
  const user = req.user;
  res.json({ user: { id: user._id, username: user.username, role: user.role } });
}

export async function logout(req, res, next) {
  try {
    await endSession(req, res);
    res.sendStatus(204);
  } catch (error) { next(error); }
}
