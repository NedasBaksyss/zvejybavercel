import { VIEW, clamp } from "../mapData.js";

export function label(ctx, value, x, y, color = "#e8ead0", selected = false) {
  ctx.font = "13px ui-monospace, monospace";
  const width = ctx.measureText(value).width + 14;
  const left = Math.round(clamp(x - width / 2, 5, VIEW.width - width - 5));
  ctx.fillStyle = selected ? "#233f37f5" : "#102c32e8";
  ctx.fillRect(left, Math.round(y), width, 22);
  ctx.strokeStyle = selected ? "#e6c48d" : "#527568";
  ctx.lineWidth = 1;
  ctx.strokeRect(left + 0.5, Math.round(y) + 0.5, width, 22);
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.fillText(value, left + 7, y + 15);
}

export function drawPlayerName(ctx, name, x, y, scale = 1) {
  if (!name) return;
  ctx.save();
  label(ctx, name, x, y - 20 * scale - 28, "#f3cf83");
  ctx.restore();
}

export function drawCharacter(ctx, x, y, time, moving, direction, holdingRod = true) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  const step = moving ? Math.round(Math.sin(time * 16) * 2) : 0;
  const back = direction === "up";
  const side = direction === "left" || direction === "right";
  const pixel = (color, px, py, width, height) => {
    ctx.fillStyle = color;
    ctx.fillRect(px, py, width, height);
  };
  ctx.fillStyle = "#102d3655";
  ctx.beginPath();
  ctx.ellipse(0, 9, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  if (direction === "left") ctx.scale(-1, 1);

  // Squared trousers and leather boots echo the reference's chunky silhouette.
  pixel("#303c2c", -6, 3, 12, 5);
  pixel("#49583b", -5, 4, 4, 5 + step);
  pixel("#36432f", 2, 4, 4, 5 - step);
  pixel("#513526", -6, 7 + step, 5, 4);
  pixel("#68432c", 2, 7 - step, 6, 4);
  pixel("#8c5c38", -5, 7 + step, 3, 1);
  pixel("#9e6b43", 3, 7 - step, 3, 1);
  pixel("#382a23", -6, 10 + step, 5, 1);
  pixel("#382a23", 2, 10 - step, 6, 1);

  // Forest-green jacket with a sunlit face and darker side panel.
  pixel("#304b2c", -7, -8, 14, 12);
  pixel("#52783d", -6, -7, 11, 10);
  pixel("#6d914d", -5, -7, 4, 9);
  pixel("#3d5e32", 4, -6, 3, 9);
  pixel("#476b35", -10, -6 + step, 4, 6);
  pixel("#779450", -10, -6 + step, 4, 2);
  pixel("#bfa27f", -10, step, 4, 4);
  pixel("#e2c7a0", -10, step, 3, 3);
  pixel("#42632f", 7, -6 - step, 4, 6);
  pixel("#668644", 7, -6 - step, 3, 2);
  pixel("#bfa27f", 7, -step, 4, 4);
  pixel("#e2c7a0", 7, -step, 3, 3);
  if (back) {
    pixel("#648747", -5, -6, 8, 2);
    pixel("#456632", -1, -4, 1, 6);
    pixel("#7b8f50", -5, 1, 8, 1);
  } else {
    pixel("#dfc397", -2, -7, 4, 3);
    pixel("#304e2c", -3, -5, 3, 3);
    pixel("#829958", 2, -6, 2, 3);
    pixel("#384d2b", 0, -2, 1, 5);
    pixel("#927047", -5, -6, 2, 9);
    pixel("#354e2c", 3, -1, 3, 3);
    pixel("#79974e", 3, -1, 3, 1);
  }
  pixel("#513628", -7, 3, 14, 2);
  pixel("#9f7b37", -1, 3, 3, 2);
  pixel("#e0bd60", -1, 3, 2, 1);

  // Brown hair, a full squared beard, blue eyes, and a protruding nose.
  pixel("#493326", -6, -18, 12, 11);
  if (!back) {
    pixel("#bc9773", -4, -17, 10, 7);
    pixel("#e3c69d", -4, -17, 7, 6);
    pixel("#f0d6ad", -3, -16, 3, 4);
    pixel("#dec19a", side ? 6 : -6, -13, 2, 3);
    pixel("#e5e8cf", side ? 3 : -3, -13, 2, 2);
    pixel("#4099b3", side ? 4 : -2, -13, 1, 2);
    if (!side) {
      pixel("#e5e8cf", 2, -13, 2, 2);
      pixel("#4099b3", 3, -13, 1, 2);
    }
    pixel("#edc89c", side ? 5 : 0, -12, 3, 2);
    pixel("#543c2c", -4, -10, 10, 4);
    pixel("#74523a", -3, -9, 3, 3);
    pixel("#392b23", 3, -10, 3, 4);
    pixel("#b78365", side ? 3 : 0, -10, 2, 1);
  } else {
    pixel("#674b32", -5, -16, 3, 8);
    pixel("#352a22", 3, -15, 3, 8);
    pixel("#a38b64", -3, -8, 5, 1);
  }

  // Layered olive hat, wide brim, and a contrasting brown leather band.
  pixel("#3b532e", -7, -22, 14, 6);
  pixel("#708b50", -6, -24, 11, 3);
  pixel("#8fa369", -4, -24, 7, 1);
  pixel("#617e42", -7, -21, 13, 3);
  pixel("#486735", 4, -22, 3, 5);
  pixel("#674129", -7, -18, 14, 2);
  pixel("#855537", -6, -18, 9, 1);
  pixel("#3b542d", -10, -16, 21, 3);
  pixel("#7c9654", -10, -16, 17, 1);
  pixel("#52733a", 7, -16, 4, 2);

  if (holdingRod) {
    ctx.strokeStyle = "#65402d";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 3);
    ctx.lineTo(15, -25);
    ctx.stroke();
    pixel("#ae8150", 9, -3, 2, 7);
    // Metal line guides and a silver spinning reel.
    pixel("#bdc8be", 12, -10, 2, 2);
    pixel("#bdc8be", 14, -21, 2, 2);
    pixel("#354148", 11, 0, 5, 5);
    pixel("#8c9b9c", 11, 0, 5, 3);
    pixel("#c5ceca", 11, 0, 4, 1);
    pixel("#39434a", 14, 3, 3, 1);
  }
  ctx.restore();
}
