import { VIEW, mix } from "../mapData.js";
import { drawCharacter } from "./mapSprites.jsx";
import { bankHeight, drawBank, drawFarEdge, drawRock } from "./lakeEdges.js";
import { LAKE_PLATFORMS, getLakePlatform, isOnLakePlatform } from "../lakePlatforms.js";
import {
  drawLakePine,
  drawLakeCabin,
  drawLakeDock,
  drawLakeIsland,
} from "./lakeSprites.jsx";

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
  scene.sky.forEach((color, index) =>
    gradient.addColorStop(index / (scene.sky.length - 1), color),
  );
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW.width, scene.horizon);

  if (scene.weather === "stars") {
    for (let i = 0; i < 42; i++) {
      ctx.fillStyle = i % 3 ? "#fff4d8" : "#ffdca8";
      ctx.fillRect(
        (i * 173) % VIEW.width,
        12 + ((i * 47) % 180),
        i % 4 ? 2 : 3,
        2,
      );
    }
  }
  if (scene.weather === "clouds") {
    ctx.fillStyle = "#e9e8d2b8";
    for (const [x, y, width] of [
      [90, 75, 150],
      [560, 112, 190],
      [790, 55, 120],
    ]) {
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
  const x =
    scene.biome === "meadow" ? 180 : scene.biome === "highland" ? 760 : 644;
  const y = scene.biome === "meadow" ? 115 : scene.horizon - 12;
  const radius = scene.biome === "meadow" ? 27 : 34;
  for (let dy = -radius; dy <= radius; dy += 2) {
    const width = Math.floor(Math.sqrt(radius * radius - dy * dy));
    ctx.fillStyle =
      scene.biome === "highland"
        ? "#e9eee2"
        : dy < 0
          ? "#ffdca8"
          : "#f2b45c";
    ctx.fillRect(x - width, y + dy, width * 2, 2);
  }
}

function drawBackdrop(ctx, scene, time) {
  if (scene.biome === "meadow") {
    ctx.fillStyle = "#638b58";
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(
        i * 180 - 30,
        scene.horizon + 30,
        120 + (i % 2) * 25,
        Math.PI,
        0,
      );
      ctx.fill();
    }
    ctx.fillStyle = "#9bb66f";
    ctx.fillRect(0, scene.horizon - 20, VIEW.width, 34);
    for (let i = 0; i < 35; i++)
      drawRoundTree(
        ctx,
        i * 31 - 10,
        scene.horizon - 13,
        12 + (i % 4) * 3,
      );
    return;
  }

  if (scene.biome === "reeds") {
    ctx.fillStyle = "#374b43";
    ctx.fillRect(0, scene.horizon - 25, VIEW.width, 34);
    drawReeds(ctx, 0, VIEW.width, scene.horizon + 8, 52, "#405f4d");
    return;
  }

  const alpine = scene.biome === "highland";
  ctx.fillStyle = alpine
    ? "#526a72"
    : scene.biome === "pine"
      ? "#28454a"
      : "#2e2157";
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
    drawLakePine(
      ctx,
      i * (alpine ? 45 : 34) - 12,
      scene.horizon + 2,
      25 + (i % 5) * 7,
      9 + (i % 4) * 3,
      alpine
        ? {
            ...PINE_COLORS,
            0: "#274845",
            1: "#365e57",
            2: "#54766a",
            highlight: "#cbd9cc",
          }
        : PINE_COLORS,
    );
  }
  if (scene.biome === "pine") {
    ctx.fillStyle = "#b8cbc39c";
    ctx.fillRect(
      0,
      scene.horizon - 36 + Math.sin(time * 0.3) * 3,
      VIEW.width,
      10,
    );
    ctx.fillStyle = "#dce2d26b";
    ctx.fillRect(160, scene.horizon - 16, 600, 7);
  }
}

function drawWater(ctx, scene, time) {
  const water = ctx.createLinearGradient(0, scene.horizon, 0, VIEW.height);
  water.addColorStop(0, scene.water[0]);
  water.addColorStop(1, scene.water[1]);
  ctx.fillStyle = water;
  ctx.fillRect(0, scene.horizon, VIEW.width, VIEW.height - scene.horizon);
  for (let i = 0; i < 72; i++) {
    const y =
      scene.horizon +
      12 +
      ((i * 31) % Math.max(40, VIEW.height - scene.horizon - 18));
    ctx.fillStyle = i % 3 ? `${scene.ripple[0]}38` : `${scene.ripple[1]}50`;
    ctx.fillRect(
      Math.round((i * 137 + Math.sin(time * 0.7 + i) * 8) % VIEW.width),
      y,
      5 + (i % 7) * 3,
      1,
    );
  }
  const reflectX = scene.biome === "meadow" ? 180 : scene.biome === "highland" ? 760 : 644;
  for (let y = scene.horizon + 4; y < VIEW.height; y += 6) {
    const depth = (y - scene.horizon) / (VIEW.height - scene.horizon);
    const width = Math.round(
      (5 + depth * 42) * (0.5 + Math.abs(Math.sin(y * 0.16 + time))),
    );
    ctx.globalAlpha = (1 - depth) * (["reeds", "pine"].includes(scene.biome) ? 0.12 : 0.62);
    ctx.fillStyle = depth < 0.45 ? scene.reflection[0] : scene.reflection[1];
    ctx.fillRect(
      reflectX - width / 2 + Math.sin(y * 0.12 + time) * 9,
      y,
      width,
      2,
    );
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
    for (let i = 0; i < 5; i++) {
      drawRock(ctx, 606 + i * 23, 307 + i % 2 * 4, 11 + i % 3 * 4);
    }
    drawLakePine(ctx, 670, 306, 39, 16, PINE_COLORS);
    drawLakeCabin(ctx, 110, 278, 0.55);
  } else if (scene.biome === "reeds") {
    drawReeds(ctx, 0, 185, 363, 70, "#557459");
    drawReeds(ctx, 720, 960, 350, 64, "#496a52");
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 ? "#5c8166" : "#78916c";
      const x = 310 + i * 47;
      const y = 333 + (i % 4) * 31;
      const width = 14 + i % 3 * 5;
      ctx.fillRect(x, y, width, 4);
      ctx.fillRect(x + 3, y - 2, width - 6, 2);
      ctx.fillStyle = "#244e4b";
      ctx.fillRect(x + width / 2, y, 3, 3);
      if (i % 5 === 0) {
        ctx.fillStyle = "#e3bcbb";
        ctx.fillRect(x + 3, y - 4, 4, 3);
      }
    }
  } else if (scene.biome === "meadow") {
    ctx.fillStyle = "#739b54";
    ctx.fillRect(0, scene.horizon - 2, VIEW.width, 16);
    drawLakeCabin(ctx, 90, 280, 0.62);
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = i % 3 ? "#f1d277" : "#e68d75";
      ctx.fillRect(15 + i * 53, scene.horizon - 8 + (i % 3) * 4, 3, 3);
    }
  } else if (scene.biome === "highland") {
    for (let i = 0; i < 16; i++) {
      const x = (i * 89) % VIEW.width;
      drawRock(ctx, x + 12, scene.horizon + 18 + (i % 3) * 19, 9 + (i % 4) * 3, true);
    }
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
    for (let i = 0; i < 5; i++)
      drawLakePine(ctx, 225 + i * 30, 333, 39 + (i % 2) * 14, 14, {
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
    ctx.strokeStyle = "#bed2cc80";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 75; i++) {
      const x = (i * 83 + time * 170) % (VIEW.width + 30) - 20;
      const y = (i * 47 + time * 310) % VIEW.height;
      ctx.moveTo(x, y);
      ctx.lineTo(x - 7, y + 14);
    }
    ctx.stroke();
  }
  if (scene.weather === "snow") {
    ctx.fillStyle = "#e9efe3d0";
    for (let i = 0; i < 58; i++) {
      const x = (i * 137 + time * (8 + (i % 5))) % VIEW.width;
      const y = (i * 67 + time * (22 + (i % 7))) % VIEW.height;
      ctx.fillRect(x, y, i % 4 ? 2 : 3, i % 3 ? 2 : 3);
    }
  }
}

function drawForeground(ctx, scene, time) {
  const left = scene.bank === "left";
  drawBank(ctx, scene, time);

  if (scene.biome === "reeds")
    drawReeds(
      ctx,
      left ? 0 : 740,
      left ? 280 : 960,
      510,
      85,
      "#294b3b",
    );
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
    // A narrow boardwalk joins each distant platform to the far shore.
    if (p.id !== "near-bank") {
      const x = Math.round(p.x + p.width / 2);
      ctx.fillStyle = "#493e35";
      ctx.fillRect(x - 7, scene.horizon + 4, 14, p.y - scene.horizon - 4);
      for (let y = scene.horizon + 4; y < p.y; y += 5) {
        ctx.fillStyle = "#98704f";
        ctx.fillRect(x - 6, y, 12, 3);
        ctx.fillStyle = "#c19b71";
        ctx.fillRect(x - 6, y, 12, 1);
      }
    }
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
  const bobberY =
    target.y +
    Math.sin(time * 1.8) * 2 +
    (pulling ? Math.sin(time * 14) * 5 : 0);
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
  ctx.quadraticCurveTo(
    (hand.x + rodTip.x) / 2,
    scene.rod.tipY + 30 - tug,
    rodTip.x,
    rodTip.y,
  );
  ctx.stroke();
  // The line must not be drawn at all until cast. A closed quadratic
  // curve still makes a visible loop even when its endpoints coincide.
  if (!cast) return;
  ctx.strokeStyle = "#cfe0f0aa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rodTip.x, rodTip.y);
  ctx.quadraticCurveTo(
    (rodTip.x + lineX) / 2,
    mix(rodTip.y, lineY, 0.5) + 18 * castAmount,
    lineX,
    lineY,
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
    7,
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
      bobberY - 20 - Math.abs(Math.sin(time * 7)) * 7,
    );
  }
}

function drawRoundTree(ctx, x, y, size) {
  ctx.fillStyle = "#31523f";
  ctx.fillRect(x - 2, y - 4, 4, 13);
  ctx.fillStyle = "#4f7952";
  ctx.fillRect(Math.round(x - size / 2), y - size + 3, size, size - 6);
  ctx.fillRect(Math.round(x - size / 2) + 3, y - size, size - 6, size);
  ctx.fillStyle = "#77a462";
  ctx.fillRect(Math.round(x - size / 3), y - size, Math.round(size * 0.6), Math.round(size * 0.5));
  ctx.fillStyle = "#96b875";
  ctx.fillRect(Math.round(x - size / 3) + 2, y - size, 5, 2);
}

function drawReeds(ctx, start, end, baseY, height, color) {
  ctx.fillStyle = color;
  for (let x = start; x < end; x += 11) {
    const reedHeight = height * (0.55 + ((x * 17) % 41) / 100);
    ctx.fillRect(x, baseY - reedHeight, 3, reedHeight);
    ctx.fillRect(x + 3, baseY - reedHeight + 7, 6, 3);
    if (x % 33 === 0) {
      ctx.fillStyle = "#6f5438";
      ctx.fillRect(x - 1, baseY - reedHeight - 7, 5, 9);
      ctx.fillStyle = color;
    }
  }
}

export function drawFishingScene(ctx, location, time, fishing, platformId) {
  const scene = sceneFor(location?.id);
  const selected = getLakePlatform(location?.id, platformId) || LAKE_PLATFORMS["quiet-lake"][0];
  drawSky(ctx, scene, time);
  drawSun(ctx, scene);
  drawBackdrop(ctx, scene, time);
  drawWater(ctx, scene, time);
  drawFarEdge(ctx, scene);
  drawSceneDetails(ctx, scene);
  drawForeground(ctx, scene, time);
  drawPlatforms(ctx, scene, location?.id, selected, time);
  drawFishingGear(ctx, { ...scene, ...selected }, time, fishing);
  drawWeather(ctx, scene, time);
}

export function canCastAt(x, y, locationId = "quiet-lake") {
  const scene = sceneFor(locationId);
  if (x < 8 || x > VIEW.width - 8 || y < scene.horizon + 24 || y > VIEW.height - 20) return false;
  if (y >= bankHeight(scene, x) - 7) return false;
  if (isOnLakePlatform(locationId, x, y)) return false;
  if ((LAKE_PLATFORMS[locationId] || []).some((p) => p.id !== "near-bank" &&
    Math.abs(x - (p.x + p.width / 2)) <= 10 && y <= p.y && y >= scene.horizon)) return false;
  if (scene.biome === "sunset" && x >= 150 && x <= 410 && y <= 362) return false;
  if (scene.biome === "pine" && x >= 565 && x <= 745 && y <= 333) return false;
  if (scene.biome === "reeds" && (x < 190 || x > 715) && y <= 366) return false;
  if (scene.biome === "highland" && y < scene.horizon + 67) return false;
  if (scene.biome === "quiet" && (x < 185 || x > 790) && y < 338) return false;
  if (
    scene.biome === "quiet" &&
    x >= 500 &&
    x <= 650 &&
    y <= 365
  )
    return false;
  if (
    scene.biome === "pine" &&
    x >= 200 &&
    x <= 400 &&
    y <= 365
  )
    return false;
  return true;
}
