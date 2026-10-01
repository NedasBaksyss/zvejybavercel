export function drawTree(ctx, x, y, size = 1, snowy = false) {
  ctx.fillStyle = "#213d33";
  ctx.fillRect(x - 1 * size, y, 2 * size, 4 * size);
  ctx.fillStyle = "#234e3d";
  ctx.beginPath();
  ctx.moveTo(x, y - 13 * size);
  ctx.lineTo(x - 6 * size, y + size);
  ctx.lineTo(x + 6 * size, y + size);
  ctx.fill();
  ctx.fillStyle = "#397051";
  ctx.beginPath();
  ctx.moveTo(x, y - 13 * size);
  ctx.lineTo(x - 6 * size, y + size);
  ctx.lineTo(x, y - size);
  ctx.fill();
  ctx.fillStyle = "#4c8058";
  ctx.fillRect(x - size, y - 8 * size, size, 3 * size);
  if (snowy) {
    for (let layer = 0; layer < 3; layer++) {
      const top = y - (13 - layer * 4) * size;
      const width = (2 + layer * 1.5) * size;
      ctx.fillStyle = "#eff5eb";
      ctx.fillRect(Math.round(x - width), Math.round(top + 3 * size), Math.round(width * 2), Math.max(1, Math.round(2 * size)));
      ctx.fillStyle = "#b6ced4";
      ctx.fillRect(Math.round(x), Math.round(top + 4 * size), Math.round(width), Math.max(1, Math.round(size)));
    }
  }
}

export function drawShop(ctx, x, y, size = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.fillStyle = "#264636";
  ctx.fillRect(-13, 2, 29, 9);
  ctx.fillStyle = "#d4bc82";
  ctx.fillRect(-11, -13, 22, 22);
  ctx.fillStyle = "#8c624a";
  ctx.fillRect(-12, -12, 24, 3);
  ctx.fillStyle = "#ad6948";
  ctx.beginPath();
  ctx.moveTo(-15, -12);
  ctx.lineTo(0, -25);
  ctx.lineTo(15, -12);
  ctx.fill();
  ctx.fillStyle = "#d89258";
  ctx.beginPath();
  ctx.moveTo(-15, -12);
  ctx.lineTo(0, -25);
  ctx.lineTo(0, -12);
  ctx.fill();
  ctx.fillStyle = "#563c31";
  ctx.fillRect(-3, -3, 6, 12);
  ctx.fillStyle = "#2d6b75";
  ctx.fillRect(-9, -7, 4, 5);
  ctx.fillRect(5, -7, 4, 5);
  ctx.fillStyle = "#f2cf86";
  ctx.fillRect(-9, -7, 3, 2);
  ctx.fillRect(5, -7, 3, 2);
  ctx.fillStyle = "#927048";
  ctx.fillRect(-7, 9, 14, 3);
  ctx.restore();
}

export function drawBroadleaf(ctx, x, y, size = 1) {
  ctx.fillStyle = "#345d4933";
  ctx.beginPath();
  ctx.ellipse(x + 4 * size, y + 2 * size, 9 * size, 3 * size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#675943";
  ctx.fillRect(x - size, y - 6 * size, 2 * size, 10 * size);
  for (const [dx, dy, radius, color] of [
    [2, -8, 7, "#396b50"], [-4, -10, 6, "#548357"],
    [0, -15, 6, "#6b965f"], [-3, -16, 3, "#8ca967"],
  ]) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + dx * size, y + dy * size, radius * size, 0, Math.PI * 2);
    ctx.fill();
  }
}
