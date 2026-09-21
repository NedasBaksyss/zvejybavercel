export function drawLakePine(ctx, x, baseY, height, width, colors) {
  ctx.fillStyle = colors.trunk;
  ctx.fillRect(Math.round(x - 2), Math.round(baseY - 4), 4, 10);
  for (let layer = 0; layer < 3; layer++) {
    const top = baseY - height + layer * height * 0.19;
    const layerHeight = height * (0.55 + layer * 0.06);
    ctx.fillStyle = colors[layer];
    for (let row = 0; row < layerHeight; row += 3) {
      const progress = row / layerHeight;
      const halfWidth = Math.max(1, Math.round(width * progress * 0.5));
      ctx.fillRect(
        Math.round(x - halfWidth),
        Math.round(top + row),
        halfWidth * 2 + 1,
        3,
      );
    }
  }
  ctx.fillStyle = colors.highlight;
  ctx.fillRect(
    Math.round(x - width * 0.22),
    Math.round(baseY - height * 0.66),
    2,
    Math.max(3, Math.round(height * 0.2)),
  );
}

export function drawLakeCabin(ctx, x, y, scale = 1) {
  ctx.fillStyle = "#7d493f";
  ctx.fillRect(x - 22 * scale, y - 12 * scale, 44 * scale, 18 * scale);
  ctx.fillStyle = "#7a2e3a";
  ctx.beginPath();
  ctx.moveTo(x - 27 * scale, y - 12 * scale);
  ctx.lineTo(x, y - 31 * scale);
  ctx.lineTo(x + 27 * scale, y - 12 * scale);
  ctx.fill();
  ctx.fillStyle = "#a9614c";
  ctx.fillRect(x - 24 * scale, y - 11 * scale, 48 * scale, 4 * scale);
  ctx.fillStyle = "#f2b45c";
  ctx.fillRect(x - 13 * scale, y - 5 * scale, 8 * scale, 8 * scale);
  ctx.fillStyle = "#291d2b";
  ctx.fillRect(x - 1 * scale, y - 3 * scale, 7 * scale, 9 * scale);
  ctx.fillStyle = "#f2b45c";
  ctx.fillRect(x + 14 * scale, y - 21 * scale, 3 * scale, 9 * scale);
  ctx.fillStyle = "#45293a";
  ctx.fillRect(x + 12 * scale, y - 23 * scale, 7 * scale, 3 * scale);
}

export function drawLakeDock(ctx, x, y, width, scale = 1) {
  ctx.fillStyle = "#241b2d";
  ctx.fillRect(x, y, width, 7 * scale);
  ctx.fillStyle = "#875145";
  for (let plank = x + 3; plank < x + width - 3; plank += 12 * scale)
    ctx.fillRect(plank, y, 7 * scale, 4 * scale);
  ctx.fillStyle = "#101c24";
  ctx.fillRect(x + 12 * scale, y + 7 * scale, 5 * scale, 30 * scale);
  ctx.fillRect(x + width - 18 * scale, y + 7 * scale, 5 * scale, 30 * scale);
  ctx.fillStyle = "#f2b45c";
  ctx.fillRect(x + width - 24 * scale, y - 8 * scale, 5 * scale, 8 * scale);
  ctx.fillStyle = "#7a453f";
  ctx.fillRect(x + width - 25 * scale, y - 10 * scale, 7 * scale, 2 * scale);
}

export function drawLakeIsland(ctx, x, y) {
  ctx.fillStyle = "#102c29";
  ctx.beginPath();
  ctx.ellipse(x, y, 68, 15, 0, 0, 7);
  ctx.fill();
  ctx.fillStyle = "#1e4938";
  ctx.beginPath();
  ctx.ellipse(x, y - 4, 55, 11, 0, 0, 7);
  ctx.fill();
  const colors = {
    trunk: "#10231f",
    0: "#153b2e",
    1: "#1c4b36",
    2: "#286044",
    highlight: "#43805a",
  };
  drawLakePine(ctx, x - 35, y - 5, 46, 15, colors);
  drawLakePine(ctx, x - 9, y - 8, 64, 21, colors);
  drawLakePine(ctx, x + 20, y - 3, 51, 17, colors);
  drawLakePine(ctx, x + 43, y - 2, 34, 12, colors);
}
