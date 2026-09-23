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

export function drawCharacter(ctx, x, y, time, moving, direction, holdingRod = true) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  const step = moving ? Math.sin(time * 16) * 2 : 0;
  ctx.fillStyle = "#0d2e3755";
  ctx.beginPath();
  ctx.ellipse(0, 8, 11, 4, 0, 0, 7);
  ctx.fill();
  ctx.fillStyle = "#283845";
  ctx.fillRect(-6, 3, 4, 7 + step);
  ctx.fillRect(2, 3, 4, 7 - step);
  ctx.fillStyle = "#df9b66";
  ctx.fillRect(-7, -6, 14, 12);
  ctx.fillStyle = "#f3cba0";
  ctx.fillRect(-5, -15, 10, 9);
  ctx.fillRect(-10, -3 + step, 3, 7);
  ctx.fillRect(7, -3 - step, 3, 7);
  ctx.fillStyle = "#425952";
  ctx.fillRect(-6, -20, 12, 7);
  ctx.fillRect(-10, -15, 20, 3);
  ctx.fillStyle = "#d8b97e";
  ctx.fillRect(-6, -16, 12, 2);
  ctx.fillStyle = "#273c3a";
  if (direction !== "up") {
    ctx.fillRect(direction === "left" ? -5 : 2, -11, 2, 2);
  }
  if (holdingRod) {
    ctx.strokeStyle = "#76553b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 3);
    ctx.lineTo(16, -24);
    ctx.stroke();
  }
  ctx.restore();
}
