// The rendered shoreline and casting boundary use the same stepped contour.
const BANKS = {
  quiet: [[0, 432], [100, 417], [180, 408], [275, 435], [350, 462], [490, 540]],
  pine: [[0, 410], [95, 402], [170, 416], [245, 439], [335, 480], [440, 540]],
  reeds: [[0, 421], [85, 415], [160, 430], [230, 432], [325, 483], [420, 540]],
  meadow: [[0, 436], [80, 420], [165, 415], [240, 446], [330, 485], [460, 540]],
  highland: [[0, 436], [90, 421], [165, 418], [245, 440], [315, 474], [405, 540]],
  sunset: [[0, 425], [75, 413], [150, 421], [230, 449], [320, 483], [430, 540]],
};
const PALETTES = {
  quiet: ["#142e2c", "#24433a", "#55664c", "#294b3e"],
  pine: ["#183932", "#2b5041", "#73846a", "#456747"],
  reeds: ["#283e31", "#43563c", "#7d7953", "#5c7045"],
  meadow: ["#426b3e", "#65884c", "#b4a874", "#93ae61"],
  highland: ["#3c5356", "#5a6c6b", "#aab9ae", "#7e9284"],
  sunset: ["#392d3d", "#655047", "#a57b62", "#805f50"],
};
export function bankHeight(scene, x) {
  const u = scene.bank === "left" ? x : 960 - x;
  const points = BANKS[scene.biome];
  for (let i = 1; i < points.length; i++) {
    const [end, y] = points[i];
    if (u <= end) {
      const [start, previous] = points[i - 1];
      const base = previous + (y - previous) * (u - start) / (end - start);
      return Math.round((base + Math.sin(u * 0.075) * 2 + Math.sin(u * 0.027) * 3) / 2) * 2;
    }
  }
  return 550;
}

export function drawBank(ctx, scene, time) {
  const [ground, edge, sand, grass] = PALETTES[scene.biome];
  for (let x = 0; x < 960; x += 4) {
    const y = bankHeight(scene, x);
    if (y > 538) continue;
    // Wet edge, exposed soil, then grass: no abrupt triangular cutout.
    ctx.fillStyle = "#071c2555";
    ctx.fillRect(x, y - 5, 4, 12);
    ctx.fillStyle = sand;
    ctx.fillRect(x, y, 4, 8);
    ctx.fillStyle = edge;
    ctx.fillRect(x, y + 5, 4, 8);
    ctx.fillStyle = ground;
    ctx.fillRect(x, y + 10, 4, 540 - y);
    if (x % 16 === 0) {
      ctx.fillStyle = grass;
      ctx.fillRect(x, y + 5, 2, 5);
      ctx.fillRect(x + 3, y + 7, 2, 3);
    }
    if (x % 28 === 0) {
      ctx.fillStyle = scene.ripple[0] + "66";
      ctx.fillRect(x, y - 8 + Math.round(Math.sin(time + x) * 2), 9, 1);
    }
  }
  for (let i = 0; i < 170; i++) {
    const x = (i * 73 + 17) % 960;
    const y = 413 + ((i * 37) % 125);
    if (y < bankHeight(scene, x) + 16) continue;
    ctx.fillStyle = i % 3 ? edge : grass;
    ctx.fillRect(x, y, 3 + i % 5, 2);
    if (scene.biome === "meadow" && i % 4 === 0) {
      ctx.fillStyle = i % 8 ? "#edd695" : "#dba5a1";
      ctx.fillRect(x, y - 4, 3, 3);
      ctx.fillStyle = "#334f35";
      ctx.fillRect(x + 1, y - 1, 1, 4);
    }
  }
}

export function drawFarEdge(ctx, scene) {
  const [, edge, sand] = PALETTES[scene.biome];
  for (let x = 0; x < 960; x += 4) {
    const depth = 4 + Math.round(3 * Math.sin(x * 0.028) + 2 * Math.sin(x * 0.079));
    ctx.fillStyle = edge;
    ctx.fillRect(x, scene.horizon - 2, 4, depth + 3);
    ctx.fillStyle = sand;
    ctx.fillRect(x, scene.horizon + depth, 4, 2);
    ctx.fillStyle = "#132c3544";
    ctx.fillRect(x, scene.horizon + depth + 3, 4, 7);
  }
}

// Side headlands anchor the distant docks directly to solid ground.
export function landingWidth(scene, platform, y) {
  const bottom = platform.y + 16;
  if (y < scene.horizon || y > bottom) return 0;
  const t = (y - scene.horizon) / (bottom - scene.horizon);
  return Math.max(0, Math.round((132 * (1 - t) ** 0.7 + 12 * Math.sin(t * Math.PI)) / 3) * 3);
}

export function drawLandings(ctx, scene, platforms) {
  const [ground, edge, sand, grass] = PALETTES[scene.biome];
  for (const p of platforms.filter((p) => p.id !== "near-bank")) {
    const left = p.x < 480;
    for (let y = scene.horizon; y <= p.y + 16; y += 2) {
      const width = landingWidth(scene, p, y);
      const x = left ? 0 : 960 - width;
      ctx.fillStyle = ground;
      ctx.fillRect(x, y, width, 2);
      const shore = left ? width : x;
      ctx.fillStyle = edge;
      ctx.fillRect(shore - (left ? 6 : 0), y, 6, 2);
      ctx.fillStyle = sand;
      ctx.fillRect(shore - (left ? 2 : 0), y, 2, 2);
      ctx.fillStyle = scene.water[0] + "88";
      ctx.fillRect(shore + (left ? 2 : -6), y + 2, 4, 2);
      if (y % 8 === 0 && width > 20) {
        ctx.fillStyle = grass;
        const detailX = left ? width - 17 : x + 12;
        ctx.fillRect(detailX, y, 5, 2);
      }
    }
    // A short worn path reaches the shoreward end of the platform.
    const startX = left ? p.x : p.x + p.width - 16;
    ctx.fillStyle = edge;
    ctx.fillRect(startX - 5, p.y - 7, 24, 7);
    ctx.fillStyle = sand;
    ctx.fillRect(startX, p.y - 4, 14, 3);
  }
}

export function drawRock(ctx, x, y, size, snowy = false) {
  ctx.fillStyle = "#162d354d";
  ctx.fillRect(x - size, y + 2, size * 2 + 6, 4);
  ctx.fillStyle = "#485d60";
  ctx.fillRect(x - size, y - 4, size * 2, 8);
  ctx.fillStyle = "#748780";
  ctx.fillRect(x - size + 3, y - 9, size * 2 - 5, 7);
  ctx.fillStyle = snowy ? "#d6e0d8" : "#a0a895";
  ctx.fillRect(x - size + 4, y - 9, size + 2, 2);
}
