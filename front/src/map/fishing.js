import { clamp } from "./mapData.js";

export const CONTROL_WIDTH = 0.26;
export const BITE_WINDOW = 7;

export function createFishingState(target = null) {
  return {
    phase: "idle", cast: false, target, elapsed: 0, phaseTime: 0,
    nextCheck: 3, chance: 0, fish: null, fishPosition: 0.5,
    fishGoal: 0.5, nextTurn: 0, control: 0.5, progress: 0.3,
    tracking: true,
  };
}

export function castLine(target) {
  return { ...createFishingState(target), phase: "waiting", cast: true };
}

export function hookFish(fishing) {
  if (fishing.phase !== "bite") return false;
  fishing.phase = "fighting";
  fishing.phaseTime = 0;
  return true;
}

// Advance using active gameplay time, never wall time or render-frame odds.
export function updateFishing(fishing, dt, keys, species, random = Math.random) {
  if (fishing.phase === "idle" || dt <= 0) return null;
  fishing.elapsed += dt;
  fishing.phaseTime += dt;
  if (fishing.phase === "waiting") {
    if (fishing.elapsed < fishing.nextCheck) return null;
    fishing.chance = Math.min(1, (fishing.nextCheck / 3) * 0.2);
    fishing.nextCheck += 3;
    if (random() < fishing.chance) {
      fishing.phase = "bite";
      fishing.phaseTime = 0;
      fishing.fish = species[Math.floor(random() * species.length)] || "carp";
      return "bite";
    }
  } else if (fishing.phase === "bite") {
    if (fishing.phaseTime >= BITE_WINDOW) return finish(fishing, "lost");
  } else if (fishing.phase === "fighting") {
    const direction = Number(keys.has("KeyD") || keys.has("ArrowRight")) -
      Number(keys.has("KeyA") || keys.has("ArrowLeft"));
    fishing.control = clamp(fishing.control + direction * dt * 0.55,
      CONTROL_WIDTH / 2, 1 - CONTROL_WIDTH / 2);
    if (fishing.phaseTime >= fishing.nextTurn) {
      fishing.fishGoal = 0.04 + random() * 0.92;
      fishing.nextTurn = fishing.phaseTime + 0.8 + random() * 0.8;
    }
    const distance = fishing.fishGoal - fishing.fishPosition;
    fishing.fishPosition += Math.sign(distance) * Math.min(Math.abs(distance), dt * 0.24);
    fishing.tracking = Math.abs(fishing.fishPosition - fishing.control) <= CONTROL_WIDTH / 2;
    fishing.progress = clamp(fishing.progress + dt * (fishing.tracking ? 0.14 : -0.18), 0, 1);
    if (fishing.progress >= 1) return finish(fishing, "caught");
    if (fishing.progress <= 0) return finish(fishing, "lost");
  } else if (fishing.phaseTime >= 2.8) {
    Object.assign(fishing, createFishingState(fishing.target));
    return "ready";
  }
  return null;
}

function finish(fishing, phase) {
  fishing.phase = phase;
  fishing.phaseTime = 0;
  fishing.cast = false;
  return phase;
}
