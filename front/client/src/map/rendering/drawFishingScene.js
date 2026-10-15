import { VIEW, mix } from "../mapData.js";
import { drawCharacter, drawPlayerName } from "./mapSprites.jsx";
import { bankHeight, drawBank, drawFarEdge, drawRock, isOnRock, drawLandings, landingWidth } from "./lakeEdges.js";
import { LAKE_PLATFORMS, getLakePlatform, isOnLakePlatform } from "../lakePlatforms.js";
import {
  drawLakePine,
  drawLakeCabin,
  drawLakeDock,
  drawLakeIsland,
} from "./lakeSprites.jsx";

const HIGHLAND_ROCKS = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 89) % VIEW.width + 12,
  offsetY: 18 + (i % 3) * 19,
  size: 9 + (i % 4) * 3,
}));

const PINE_COLORS = {
  trunk: "#102a25",
  0: "#15392d",
  1: "#1d4835",
  2: "#26583f",
  highlight: "#3c7350",
};

export const LAKE_SCENES = {
  "quiet-lake": {
    sky: ["#1a183a", "#5b3a6b", "#e0765a", "#ffdca8"],
    water: ["#2e3c66", "#0c0f20"],
    ripple: ["#8fa8c8", "#e7dbf2"],
    reflection: ["#f2b45c", "#e0765a"],
    horizon: 282,
    biome: "quiet",
    weather: "stars",
    bank: "left",
    angler: { x: 173, y: 441, direction: "right" },
    rod: { x: 197, y: 420, tipX: 326, tipY: 325 },
    target: { x: 548, y: 386 },
  },
  "pine-lake": {
    sky: ["#172c3d", "#355668", "#789193", "#c9c6a5"],
    water: ["#365d68", "#102c38"],
    ripple: ["#91b6b0", "#d2ddd0"],
    reflection: ["#b9c9a1", "#789b91"],
    horizon: 260,
    biome: "pine",
    weather: "mist",
    bank: "right",
    angler: { x: 786, y: 426, direction: "left" },
    rod: { x: 766, y: 406, tipX: 632, tipY: 315 },
    target: { x: 440, y: 382 },
  },
  "reed-lake": {
    sky: ["#26343e", "#52666a", "#82918a", "#b4ad91"],
    water: ["#496b69", "#172f35"],
    ripple: ["#789b94", "#c2cbb1"],
    reflection: ["#9ba986", "#5b8278"],
    horizon: 246,
    biome: "reeds",
    weather: "rain",
    bank: "left",
    angler: { x: 150, y: 432, direction: "right" },
    rod: { x: 175, y: 411, tipX: 330, tipY: 310 },
    target: { x: 560, y: 380 },
  },
  "meadow-lake": {
    sky: ["#4b8db2", "#7fc1cf", "#c6ddd0", "#f2deb0"],
    water: ["#4b9ca2", "#1c5968"],
    ripple: ["#a9d9cd", "#e7e1b7"],
    reflection: ["#f4db8e", "#91c7ad"],
    horizon: 270,
    biome: "meadow",
    weather: "clouds",
    bank: "right",
    angler: { x: 790, y: 438, direction: "left" },
    rod: { x: 770, y: 416, tipX: 640, tipY: 326 },
    target: { x: 430, y: 390 },
  },
  "highland-lake": {
    sky: ["#1c354e", "#526e82", "#9daeb2", "#e1d9c3"],
    water: ["#416879", "#132d42"],
    ripple: ["#9ec8cf", "#e2ece5"],
    reflection: ["#d7e2d8", "#749da8"],
    horizon: 274,
    biome: "highland",
    weather: "snow",
    bank: "left",
    angler: { x: 207, y: 430, direction: "right" },
    rod: { x: 231, y: 410, tipX: 370, tipY: 315 },
    target: { x: 590, y: 390 },
  },
  "sunset-lake": {
    sky: ["#321b49", "#8a3556", "#dc694e", "#ffd07c"],
    water: ["#493b62", "#17162b"],
    ripple: ["#a26a7c", "#efb47d"],
    reflection: ["#ffd078", "#d5534f"],
    horizon: 286,
    biome: "sunset",
    weather: "birds",
    bank: "right",
    angler: { x: 780, y: 440, direction: "left" },
    rod: { x: 758, y: 419, tipX: 620, tipY: 326 },
    target: { x: 405, y: 395 },
  },
};

const sceneFor = (id) => LAKE_SCENES[id] || LAKE_SCENES["quiet-lake"];

function drawSky(ctx, scene, time) {
  const gradient = ctx.createLinearGradient(0, 0, 0, scene.horizon);
  scene.sky.forEach((color, index) => gradient.addColorStop(index / (scene.sky.length - 1), color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW.width, scene.horizon);
  if (scene.weather === "stars") {
    for (let i = 0; i < 42; i++) {
      ctx.fillStyle = i % 3 ? "#fff4d8" : "#ffdca8";
      ctx.fillRect((i * 173) % VIEW.width, 12 + ((i * 47) % 180), i % 4 ? 2 : 3, 2);
    }
  }
  if (scene.weather === "clouds") {
    ctx.fillStyle = "#e9e8d2b8";
    for (const [x, y, width] of [[90, 75, 150], [560, 112, 190], [790, 55, 120]]) {
      ctx.fillRect(x, y, width, 12);
      ctx.fillRect(x + 24, y - 12, width - 55, 12);
      ctx.fillRect(x + 52, y - 20, width - 100, 8);
    }
  }
  if (scene.weather === "birds") {
    ctx.fillStyle = "#301d3b";
    for (let i = 0; i < 5; i++) {
      const x = ((time * 18 + i * 181) % 1100) - 70;
      const y = 72 + i * 17;
      ctx.fillRect(x, y, 3, 2);
      ctx.fillRect(x - 4, y - 2, 4, 2);
      ctx.fillRect(x + 3, y - 2, 4, 2);
    }
  }
}

function drawSun(ctx, scene) {
  if (scene.biome === "pine" || scene.biome === "reeds") return;
  const x = scene.biome === "meadow" ? 180 : scene.biome === "highland" ? 760 : 644;
  const y = scene.biome === "meadow" ? 115 : scene.horizon - 12;
  const radius = scene.biome === "meadow" ? 27 : 34;
  for (let dy = -radius; dy <= radius; dy += 2) {
    const width = Math.floor(Math.sqrt(radius * radius - dy * dy));
    ctx.fillStyle = scene.biome === "highland" ? "#e9eee2" : dy < 0 ? "#ffdca8" : "#f2b45c";
    ctx.fillRect(x - width, y + dy, width * 2, 2);
  }
}

function drawBackdrop(ctx, scene) {
  if (scene.biome === "meadow") {
    for (let layer = 0; layer < 3; layer++) {
      ctx.fillStyle = ["#8cae83", "#749968", "#608756"][layer];
      for (let x = 0; x < VIEW.width; x += 3) {
        const top = scene.horizon - 65 + layer * 24 + Math.round(18 * Math.sin(x * 0.009 + layer * 2) + 9 * Math.sin(x * 0.017 + layer));
        ctx.fillRect(x, top, 3, scene.horizon - top);
      }
    }
    ctx.fillStyle = "#9bb66f";
    ctx.fillRect(0, scene.horizon - 20, VIEW.width, 34);
    for (let i = 0; i < 24; i++) drawRoundTree(ctx, Math.round(noise(i + 31) * VIEW.width), scene.horizon - 14 - Math.round(noise(i + 71) * 9), 12 + Math.round(noise(i + 81) * 16));
    return;
  }
  if (scene.biome === "reeds") {
    for (let layer = 0; layer < 2; layer++) {
      ctx.fillStyle = layer ? "#354f48" : "#667c73";
      for (let x = 0; x < VIEW.width; x += 3) {
        const top = scene.horizon - 24 - layer * 7 - Math.round(12 * Math.sin(x * 0.011 + layer) + 7 * Math.sin(x * 0.031));
        ctx.fillRect(x, top, 3, scene.horizon - top);
      }
    }
    for (const [x, width] of [[0, 120], [210, 95], [460, 145], [790, 170]]) drawReeds(ctx, x, x + width, scene.horizon - 2, 22, "#61745a");
    return;
  }
  const alpine = scene.biome === "highland";
  ctx.fillStyle = alpine ? "#526a72" : scene.biome === "pine" ? "#28454a" : "#2e2157";
  for (let i = 0; i < 7; i++) {
    const x = i * 170 - 100;
    const peak = alpine ? 105 + (i % 3) * 27 : 165 + (i % 3) * 22;
    ctx.fillStyle = alpine ? "#526a72" : scene.biome === "pine" ? "#28454a" : "#2e2157";
    ctx.beginPath();
    ctx.moveTo(x, scene.horizon);
    ctx.lineTo(x + 108, peak);
    ctx.lineTo(x + 250, scene.horizon);
    ctx.fill();
    ctx.fillStyle = alpine ? "#677f85" : scene.biome === "pine" ? "#345358" : "#3d2d60";
    ctx.beginPath();
    ctx.moveTo(x + 108, peak);
    ctx.lineTo(x + 72, peak + 68);
    ctx.lineTo(x + 106, peak + 100);
    ctx.lineTo(x + 85, scene.horizon);
    ctx.lineTo(x, scene.horizon);
    ctx.fill();
    if (alpine) {
      ctx.fillStyle = "#d8e1dc";
      ctx.beginPath();
      ctx.moveTo(x + 108, peak);
      ctx.lineTo(x + 76, peak + 48);
      ctx.lineTo(x + 108, peak + 37);
      ctx.lineTo(x + 128, peak + 55);
      ctx.lineTo(x + 144, peak + 42);
      ctx.fill();
      ctx.fillStyle = "#526a72";
    }
  }
  ctx.fillStyle = alpine ? "#334e4e" : "#17352f";
  ctx.fillRect(0, scene.horizon - 14, VIEW.width, 25);
  for (let i = 0; i < (alpine ? 22 : 30); i++) {
    drawLakePine(ctx, i * (alpine ? 45 : 34) - 12, scene.horizon + 2, 25 + (i % 5) * 7, 9 + (i % 4) * 3, alpine ? {
      ...PINE_COLORS,
      0: "#274845",
      1: "#365e57",
      2: "#54766a",
      highlight: "#cbd9cc",
    } : PINE_COLORS);
  }
  if (scene.biome === "pine") {
    const mist = ctx.createLinearGradient(0, scene.horizon - 65, 0, scene.horizon);
    mist.addColorStop(0, "#bdcfc000");
    mist.addColorStop(0.7, "#bdcfc032");
    mist.addColorStop(1, "#bdcfc000");
    ctx.fillStyle = mist;
    ctx.fillRect(0, scene.horizon - 65, VIEW.width, 65);
  }
}

function drawWater(ctx, scene, time) {
  const water = ctx.createLinearGradient(0, scene.horizon, 0, VIEW.height);
  water.addColorStop(0, scene.water[0]);
  water.addColorStop(1, scene.water[1]);
  ctx.fillStyle = water;
  ctx.fillRect(0, scene.horizon, VIEW.width, VIEW.height - scene.horizon);
  for (let i = 0; i < 72; i++) {
    const y = scene.horizon + 12 + ((i * 31) % Math.max(40, VIEW.height - scene.horizon - 18));
    ctx.fillStyle = i % 3 ? `${scene.ripple[0]}38` : `${scene.ripple[1]}50`;
    ctx.fillRect(Math.round((i * 137 + Math.sin(time * 0.7 + i) * 8) % VIEW.width), y, 5 + (i % 7) * 3, 1);
  }
  const reflectX = scene.biome === "meadow" ? 180 : scene.biome === "highland" ? 760 : 644;
  for (let y = scene.horizon + 4; y < VIEW.height; y += 6) {
    const depth = (y - scene.horizon) / (VIEW.height - scene.horizon);
    const width = Math.round((5 + depth * 42) * (0.5 + Math.abs(Math.sin(y * 0.16 + time))));
    ctx.globalAlpha = (1 - depth) * (["reeds", "pine"].includes(scene.biome) ? 0.12 : 0.62);
    ctx.fillStyle = depth < 0.45 ? scene.reflection[0] : scene.reflection[1];
    ctx.fillRect(reflectX - width / 2 + Math.sin(y * 0.12 + time) * 9, y, width, 2);
  }
  ctx.globalAlpha = 1;
}

function drawSceneDetails(ctx, scene) {
  if (scene.biome === "quiet") {
    drawLakeCabin(ctx, 58, 294, 0.7);
    drawLakeCabin(ctx, 904, 294, 0.65);
    drawLakeIsland(ctx, 575, 345);
  } else if (scene.biome === "pine") {
    drawLakeIsland(ctx, 300, 330);
    ctx.fillStyle = "#1c3732";
    ctx.beginPath();
    ctx.ellipse(655, 309, 82, 15, 0, 0, 7);
    ctx.fill();
    for (let i = 0; i < 5; i++) drawRock(ctx, 606 + i * 23, 307 + i % 2 * 4, 11 + i % 3 * 4);
    drawLakePine(ctx, 670, 306, 39, 16, PINE_COLORS);
    drawLakeCabin(ctx, 110, 278, 0.55);
  } else if (scene.biome === "reeds") {
    drawReeds(ctx, 0, 65, scene.horizon + 12, 29, "#72805a");
    drawReeds(ctx, 878, 960, scene.horizon + 10, 34, "#657c56");
  } else if (scene.biome === "meadow") {
    ctx.fillStyle = "#739b54";
    ctx.fillRect(0, scene.horizon - 2, VIEW.width, 16);
    drawLakeCabin(ctx, 90, 280, 0.62);
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = i % 3 ? "#f1d277" : "#e68d75";
      ctx.fillRect(15 + i * 53, scene.horizon - 8 + (i % 3) * 4, 3, 3);
    }
  } else if (scene.biome === "highland") {
    for (const rock of HIGHLAND_ROCKS) drawRock(ctx, rock.x, scene.horizon + rock.offsetY, rock.size, true);
  } else {
    ctx.fillStyle = "#251b32";
    ctx.beginPath();
    ctx.ellipse(280, 337, 125, 19, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#a4786b88";
    for (let i = 0; i < 19; i++) {
      const dx = -112 + i * 12;
      ctx.fillRect(280 + dx, 337 + Math.round(17 * Math.sqrt(1 - (dx / 125) ** 2)), 7, 2);
    }
    for (let i = 0; i < 5; i++) drawLakePine(ctx, 225 + i * 30, 333, 39 + (i % 2) * 14, 14, {
      ...PINE_COLORS,
      0: "#21182c",
      1: "#2f243a",
      2: "#47314b",
      highlight: "#734354",
    });
  }
}

function drawWeather(ctx, scene, time) {
  if (scene.weather === "rain") {
    for (let i = 0; i < 48; i++) {
      const depth = noise(i + 14);
      const x = Math.floor((noise(i + 81) * 1000 + time * (12 + depth * 8)) % 1000) - 20;
      const y = Math.floor((noise(i + 231) * 580 + time * (190 + depth * 120)) % 580) - 20;
      ctx.fillStyle = depth > 0.6 ? "#d0dedb42" : "#c0d1cb24";
      ctx.fillRect(x, y, 1, 3 + Math.round(depth * 4));
    }
    for (let i = 0; i < 24; i++) {
      const x = 155 + noise(i + 400) * 650;
      const y = scene.horizon + 30 + noise(i + 500) * 220;
      const age = (time * 0.8 + noise(i + 600)) % 1;
      if (age > 0.45 || y >= bankHeight(scene, x) - 10) continue;
      ctx.fillStyle = `rgba(185,211,203,${(1 - age / 0.45) * 0.22})`;
      const width = 2 + Math.floor(age * 18);
      ctx.fillRect(Math.round(x - width / 2), Math.round(y), width, 1);
      ctx.fillRect(Math.round(x - width / 2) - 1, Math.round(y) - 1, 1, 1);
    }
  }
  if (scene.weather === "snow") {
    ctx.fillStyle = "#e9efe3d0";
    for (let i = 0; i < 58; i++) {
      const x = (noise(i + 91) * VIEW.width + time * (5 + (i % 5)) + Math.sin(time * 0.4 + i) * 5) % VIEW.width;
      const y = (noise(i + 171) * VIEW.height + time * (12 + (i % 7))) % VIEW.height;
      ctx.globalAlpha = 0.25 + noise(i + 51) * 0.5;
      ctx.fillRect(Math.round(x), Math.round(y), i % 4 ? 1 : 2, i % 4 ? 1 : 2);
    }
    ctx.globalAlpha = 1;
  }
}

function drawForeground(ctx, scene, time) {
  const left = scene.bank === "left";
  drawBank(ctx, scene, time);
  if (scene.biome === "reeds") {
    for (const x of [8, 36, 78, 225, 264, 312]) {
      const y = bankHeight(scene, x) + 18;
      if (y < 530) drawReeds(ctx, x, x + 16, y, 24 + noise(x) * 19, "#6b7950");
    }
  }
  if (scene.biome === "highland") {
    for (let i = 0; i < 12; i++) {
      const x = left ? i * 37 : VIEW.width - i * 37;
      const y = bankHeight(scene, x) + 27;
      if (y < 530) drawRock(ctx, x, y, 10 + i % 8, true);
    }
  }
  if (["quiet", "pine", "sunset"].includes(scene.biome)) {
    for (let i = 0; i < 9; i++) {
      const x = left ? 12 + i * 38 : 948 - i * 38;
      const y = bankHeight(scene, x) + 40;
      if (Math.abs(x - scene.angler.x) < 95 || y > 540) continue;
      drawLakePine(ctx, x, y, 42 + i % 4 * 12, 22 + i % 3 * 4, PINE_COLORS);
    }
  }
}

function drawPlatforms(ctx, scene, lakeId, selected, time) {
  const platforms = LAKE_PLATFORMS[lakeId] || LAKE_PLATFORMS["quiet-lake"];
  for (const p of [...platforms].sort((a, b) => a.y - b.y)) {
    drawLakeDock(ctx, p.x, p.y, p.width, p.scale);
    if (p.id === selected.id) {
      ctx.save();
      ctx.translate(p.angler.x, p.angler.y);
      ctx.scale(p.scale, p.scale);
      drawCharacter(ctx, 0, 0, time, false, p.angler.direction, false);
      ctx.restore();
    }
  }
}

function drawFishingGear(ctx, scene, time, fishing) {
  const pulling = fishing?.phase === "bite" || fishing?.phase === "fighting";
  const tug = pulling ? 10 + Math.sin(time * 14) * 7 : 0;
  const pullDirection = scene.angler.direction === "right" ? -0.45 : 0.45;
  const rodTip = {
    x: scene.rod.tipX + tug * pullDirection,
    y: scene.rod.tipY + tug,
  };
  const cast = fishing?.cast;
  const target = fishing?.target || scene.target;
  const bobberX = target.x + Math.sin(time * 0.7) * 7;
  const bobberY = target.y + Math.sin(time * 1.8) * 2 + (pulling ? Math.sin(time * 14) * 5 : 0);
  const castAmount = cast ? Math.min(1, fishing.elapsed / 0.45) : 0;
  const lineX = mix(rodTip.x, bobberX, castAmount);
  const lineY = mix(rodTip.y, bobberY, castAmount);
  const hand = {
    x: scene.angler.x + (scene.angler.direction === "right" ? 9 : -9) * scene.scale,
    y: scene.angler.y - scene.scale,
  };
  ctx.strokeStyle = "#241c30";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hand.x, hand.y);
  ctx.quadraticCurveTo((hand.x + rodTip.x) / 2, scene.rod.tipY + 30 - tug, rodTip.x, rodTip.y);
  ctx.stroke();
  if (!cast) return;
  ctx.strokeStyle = "#cfe0f0aa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rodTip.x, rodTip.y);
  ctx.quadraticCurveTo((rodTip.x + lineX) / 2, mix(rodTip.y, lineY, 0.5) + 18 * castAmount, lineX, lineY);
  ctx.stroke();
  const ripple = (time * 18) % 38;
  ctx.strokeStyle = "#cfe0f080";
  ctx.beginPath();
  ctx.ellipse(bobberX, bobberY + 4, 12 + ripple, 4 + ripple * 0.22, 0, 0, 7);
  ctx.stroke();
  ctx.fillStyle = "#d4574e";
  ctx.fillRect(bobberX - 2, bobberY - 6, 4, 10);
  ctx.fillStyle = "#ffdca8";
  ctx.fillRect(bobberX - 2, bobberY - 8, 4, 3);
  if (fishing.phase === "bite") {
    ctx.font = "bold 26px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffdca8";
    ctx.fillText("!", bobberX, bobberY - 20 - Math.abs(Math.sin(time * 7)) * 7);
  }
}

function drawRemoteFishingPlayer(ctx, remotePlayer, time) {
  const fishing = remotePlayer?.fishing;
  if (!fishing) return;
  const x = Number(fishing.x);
  const y = Number(fishing.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  const scale = Number(fishing.scale) || 1;
  const direction = fishing.direction || "down";
  drawCharacter(ctx, x, y, time, false, direction, true);
  drawPlayerName(ctx, remotePlayer.name || "Player", x, y, scale);
}

function drawRemoteFishingGear(ctx, remotePlayer, time) {
  const fishing = remotePlayer?.fishing;
  if (!fishing) return;

  const playerX = Number(fishing.x);
  const playerY = Number(fishing.y);

  if (!Number.isFinite(playerX) || !Number.isFinite(playerY)) return;

  const scale = Number(fishing.scale) || 1;
  const direction = fishing.direction || "right";
  const pulling = fishing.phase === "bite" || fishing.phase === "fighting";
  const tug = pulling ? 10 + Math.sin(time * 14) * 7 : 0;
  const pullDirection = direction === "right" ? -0.45 : 0.45;

  // Match the local player's hand position.
  const hand = {
    x: playerX + (direction === "right" ? 9 : -9) * scale,
    y: playerY - scale,
  };

  // Use synchronized rod tip coordinates if available.
  // Otherwise, calculate a reasonable tip position.
  const rodTip = {
    x: Number.isFinite(Number(fishing.rodTipX))
      ? Number(fishing.rodTipX) + tug * pullDirection
      : hand.x + (direction === "right" ? 115 : -115) * scale + tug * pullDirection,
    y: Number.isFinite(Number(fishing.rodTipY))
      ? Number(fishing.rodTipY) + tug
      : hand.y - 85 * scale + tug,
  };

  // Always draw the rod, even before casting.
  ctx.strokeStyle = "#241c30";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hand.x, hand.y);
  ctx.quadraticCurveTo(
    (hand.x + rodTip.x) / 2,
    rodTip.y + 30 * scale - tug,
    rodTip.x,
    rodTip.y
  );
  ctx.stroke();

  // No line or bobber until the remote player casts.
  if (!fishing.active || !fishing.target) return;

  const targetX = Number(fishing.target.x);
  const targetY = Number(fishing.target.y);

  if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) return;

  const bobberX = targetX + Math.sin(time * 0.7) * 7;
  const bobberY =
    targetY +
    Math.sin(time * 1.8) * 2 +
    (pulling ? Math.sin(time * 14) * 5 : 0);

  ctx.strokeStyle = "#cfe0f0aa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rodTip.x, rodTip.y);
  ctx.quadraticCurveTo(
    (rodTip.x + bobberX) / 2,
    (rodTip.y + bobberY) / 2 + 18,
    bobberX,
    bobberY
  );
  ctx.stroke();

  const ripple = (time * 18) % 38;
  ctx.strokeStyle = "#cfe0f080";
  ctx.beginPath();
  ctx.ellipse(
    bobberX,
    bobberY + 4,
    12 + ripple,
    4 + ripple * 0.22,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.fillStyle = "#d4574e";
  ctx.fillRect(bobberX - 2, bobberY - 6, 4, 10);
  ctx.fillStyle = "#ffdca8";
  ctx.fillRect(bobberX - 2, bobberY - 8, 4, 3);

  if (fishing.phase === "bite") {
    ctx.font = "bold 26px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffdca8";
    ctx.fillText(
      "!",
      bobberX,
      bobberY - 20 - Math.abs(Math.sin(time * 7)) * 7
    );
  }
}

function drawRoundTree(ctx, x, y, size) {
  ctx.fillStyle = "#31523f";
  ctx.fillRect(x - 2, y - 4, 4, 13);
  for (let row = 0; row < size; row += 2) {
    const half = Math.round(Math.sqrt(Math.max(0, 1 - ((row - size * 0.5) / (size * 0.52)) ** 2)) * size * 0.6);
    ctx.fillStyle = row > size * 0.65 ? "#426b46" : "#638e52";
    ctx.fillRect(x - half, y - size + row, half * 2, 2);
    ctx.fillStyle = "#8eae65";
    if (row > 2 && row < size * 0.55) ctx.fillRect(x - half + 2, y - size + row, Math.max(2, half - 2), 2);
  }
}

function noise(seed) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function drawReeds(ctx, start, end, baseY, height, color) {
  for (let x = start; x < end; x += 5 + Math.floor(noise(x) * 6)) {
    const reedHeight = Math.round(height * (0.4 + noise(x + 5) * 0.6));
    const top = Math.round(baseY - reedHeight);
    ctx.fillStyle = color;
    ctx.fillRect(x, top, 1, reedHeight);
    ctx.fillRect(x - 2, top + Math.round(reedHeight * 0.5), 2, Math.round(reedHeight * 0.3));
    ctx.fillRect(x + 1, top + Math.round(reedHeight * 0.35), 2, Math.round(reedHeight * 0.25));
    if (noise(x + 10) > 0.6) {
      ctx.fillStyle = "#8b7953";
      ctx.fillRect(x - 1, top - 4, 2, 6);
    }
  }
}

export function drawFishingScene(ctx, location, time, fishing, platformId, playerName, remotePlayers) {
  const scene = sceneFor(location?.id);
  const selected = getLakePlatform(location?.id, platformId) || LAKE_PLATFORMS["quiet-lake"][0];
  drawSky(ctx, scene, time);
  drawSun(ctx, scene);
  drawBackdrop(ctx, scene);
  drawWater(ctx, scene, time);
  drawFarEdge(ctx, scene);
  drawLandings(ctx, scene, LAKE_PLATFORMS[location?.id] || LAKE_PLATFORMS["quiet-lake"]);
  drawSceneDetails(ctx, scene);
  drawForeground(ctx, scene, time);
  drawPlatforms(ctx, scene, location?.id, selected, time);
  drawFishingGear(ctx, { ...scene, ...selected }, time, fishing);
  drawWeather(ctx, scene, time);

  drawPlayerName(ctx, playerName, selected.angler.x, selected.angler.y, selected.scale);

  if (remotePlayers) {
    for (const remotePlayer of remotePlayers.values()) {
      const remoteFishing = remotePlayer?.fishing;

      /*
       * No fishing presence means the player is not
       * currently inside a lake.
       */
      if (!remoteFishing) continue;

      /*
       * Only show them in the lake they are actually in.
       */
      if (remoteFishing.lakeId !== location?.id) continue;

      drawRemoteFishingPlayer(ctx, remotePlayer, time);
      drawRemoteFishingGear(ctx, remotePlayer, time);
    }
  }
}

export function canCastAt(x, y, locationId = "quiet-lake") {
  const scene = sceneFor(locationId);
  if (x < 8 || x > VIEW.width - 8 || y < scene.horizon + 24 || y > VIEW.height - 20) return false;
  if (y >= bankHeight(scene, x) - 7) return false;
  if (isOnLakePlatform(locationId, x, y)) return false;
  if ((LAKE_PLATFORMS[locationId] || []).some((p) => {
    if (p.id === "near-bank") return false;
    const width = landingWidth(scene, p, y);
    return width > 0 && (p.x < 480 ? x <= width + 4 : x >= VIEW.width - width - 4);
  })) return false;
  if (scene.biome === "sunset" && x >= 150 && x <= 410 && y <= 362) return false;
  if (scene.biome === "pine" && x >= 565 && x <= 745 && y <= 333) return false;
  if (scene.biome === "reeds" && (x < 190 || x > 715) && y <= 366) return false;
  if (scene.biome === "highland" && HIGHLAND_ROCKS.some((rock) => isOnRock(x, y, rock.x, scene.horizon + rock.offsetY, rock.size))) return false;
  if (scene.biome === "quiet" && (x < 185 || x > 790) && y < 338) return false;
  if (scene.biome === "quiet" && x >= 500 && x <= 650 && y <= 365) return false;
  if (scene.biome === "pine" && x >= 200 && x <= 400 && y <= 365) return false;
  return true;
}
