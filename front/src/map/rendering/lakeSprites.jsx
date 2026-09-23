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
  x = Math.round(x);
  y = Math.round(y);
  width = Math.round(width);
  const plankWidth = Math.max(4, Math.round(10 * scale));
  const depth = Math.max(3, Math.round(7 * scale));
  ctx.fillStyle = "#0c1a2744";
  ctx.fillRect(x + 5, y + depth + 5, width - 5, 4);
  ctx.fillStyle = "#241b2d";
  ctx.fillRect(x, y, width, depth);
  for (let plank = x + 2, i = 0; plank < x + width - 2; plank += plankWidth, i++) {
    const w = Math.min(plankWidth - 1, x + width - 2 - plank);
    ctx.fillStyle = i % 3 ? "#875b49" : "#9a6d53";
    ctx.fillRect(plank, y, w, Math.max(2, depth - 2));
    ctx.fillStyle = "#bf9570";
    ctx.fillRect(plank, y, w, 1);
    ctx.fillStyle = "#4c3b35";
    if (w > 4) ctx.fillRect(plank + 2, y + 2, 1, 1);
  }
  ctx.fillStyle = "#101c24";
  for (const post of [x + Math.round(12 * scale), x + width - Math.round(18 * scale)]) {
    ctx.fillStyle = "#18272b";
    ctx.fillRect(post, y + depth, Math.max(3, Math.round(5 * scale)), Math.round(30 * scale));
    ctx.fillStyle = "#725540";
    ctx.fillRect(post, y + depth, 1, Math.round(21 * scale));
    ctx.fillStyle = "#a3b4ad44";
    ctx.fillRect(post - 4, y + Math.round(35 * scale), 13, 1);
  }
  ctx.fillStyle = "#f2b45c";
  ctx.fillRect(x + width - 24 * scale, y - 8 * scale, 5 * scale, 8 * scale);
  ctx.fillStyle = "#7a453f";
  ctx.fillRect(x + width - 25 * scale, y - 10 * scale, 7 * scale, 2 * scale);
}

export function drawLakeIsland(ctx, x, y) {
  ctx.fillStyle = "#779d9555";
  for (let row = -12; row <= 12; row += 2) {
    const half = Math.round(72 * Math.sqrt(1 - (row / 14) ** 2));
    ctx.fillRect(x - half, y + row + 5, half * 2, 2);
  }
  ctx.fillStyle = "#102c29";
  ctx.beginPath();
  ctx.ellipse(x, y, 68, 15, 0, 0, 7);
  ctx.fill();
  ctx.fillStyle = "#779067";
  for (let i = 0; i < 12; i++) {
    const dx = -53 + i * 9;
    ctx.fillRect(x + dx, y + Math.round(9 * Math.sqrt(1 - (dx / 65) ** 2)), 5, 2);
  }
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
