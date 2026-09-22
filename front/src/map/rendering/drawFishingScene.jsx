import { VIEW, mix } from "../mapData.js";
import { drawCharacter } from "./mapSprites.jsx";
import {
  drawLakePine,
  drawLakeCabin,
  drawLakeDock,
  drawLakeIsland,
} from "./lakeSprites.jsx";

export function drawFishingScene(ctx, time, fishing) {
  const waterTop = 282;
  const pulling = fishing?.phase === "bite" || fishing?.phase === "fighting";
  const tug = pulling ? 10 + Math.sin(time * 14) * 7 : 0;
  const rodTip = { x: 326 - tug * 0.45, y: 325 + tug };
  const cast = fishing?.cast;
  const target = fishing?.target || { x: 548, y: 386 };
  const bobberX = target.x + Math.sin(time * 0.7) * 7;
  const bobberY = target.y + Math.sin(time * 1.8) * 2 + (pulling ? Math.sin(time * 14) * 5 : 0);
  const castAmount = cast
    ? Math.min(1, fishing.elapsed / 0.45)
    : 0;
  const lineX = mix(rodTip.x, bobberX, castAmount);
  const lineY = mix(rodTip.y, bobberY, castAmount);
  const sky = ctx.createLinearGradient(0, 0, 0, waterTop);
  sky.addColorStop(0, "#1a183a");
  sky.addColorStop(0.34, "#2e2157");
  sky.addColorStop(0.56, "#5b3a6b");
  sky.addColorStop(0.74, "#a4506b");
  sky.addColorStop(0.88, "#e0765a");
  sky.addColorStop(0.97, "#f2b45c");
  sky.addColorStop(1, "#ffdca8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW.width, waterTop);
  for (let i = 0; i < 42; i++) {
    const x = (i * 173) % VIEW.width;
    const y = 12 + ((i * 47) % 180);
    ctx.fillStyle = i % 3 ? "#fff4d8" : "#ffdca8";
    ctx.fillRect(x, y, i % 4 ? 2 : 3, i % 5 ? 2 : 3);
  }
  const sunX = 644;
  const sunY = waterTop - 12;
  for (let dy = -34; dy <= 34; dy++) {
    const width = Math.floor(Math.sqrt(34 * 34 - dy * dy));
    ctx.fillStyle = dy < 0 ? "#ffdca8" : "#f2b45c";
    ctx.fillRect(sunX - width, sunY + dy, width * 2, 2);
  }
  ctx.fillStyle = "#2e2157";
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 170 - 100, 282);
    ctx.lineTo(i * 170 + 8, 165 + (i % 3) * 22);
    ctx.lineTo(i * 170 + 150, 282);
    ctx.fill();
  }
  ctx.fillStyle = "#17352f";
  ctx.fillRect(0, 268, VIEW.width, 22);
  for (let i = 0; i < 30; i++)
    drawLakePine(
      ctx,
      i * 34 - 12,
      283 + (i % 3) * 2,
      25 + (i % 5) * 7,
      9 + (i % 4) * 3,
      {
        trunk: "#102a25",
        0: "#15392d",
        1: "#1d4835",
        2: "#26583f",
        highlight: "#3c7350",
      },
    );
  const water = ctx.createLinearGradient(0, waterTop, 0, VIEW.height);
  water.addColorStop(0, "#2e3c66");
  water.addColorStop(1, "#0c0f20");
  ctx.fillStyle = water;
  ctx.fillRect(0, waterTop, VIEW.width, VIEW.height - waterTop);
  for (let y = waterTop + 4; y < VIEW.height; y += 5) {
    const depth = (y - waterTop) / (VIEW.height - waterTop);
    const width = Math.max(
      2,
      Math.round(
        (4 + depth * 46) * (0.5 + Math.abs(Math.sin(y * 0.19 + time))),
      ),
    );
    ctx.globalAlpha = (1 - depth) * 0.8;
    ctx.fillStyle = depth < 0.45 ? "#f2b45c" : "#e0765a";
    ctx.fillRect(
      Math.round(sunX - width / 2 + Math.sin(y * 0.13 + time * 2) * 12),
      y,
      width,
      2,
    );
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#17352f";
  ctx.fillRect(0, 282, VIEW.width, 28);
  for (let i = 0; i < 28; i++)
    drawLakePine(
      ctx,
      i * 37 - 10,
      293 + (i % 2) * 3,
      18 + (i % 4) * 7,
      7 + (i % 3) * 3,
      {
        trunk: "#102a25",
        0: "#15392d",
        1: "#1d4a35",
        2: "#285b40",
        highlight: "#3c7350",
      },
    );
  drawLakeCabin(ctx, 58, 294, 0.7);
  drawLakeCabin(ctx, 904, 294, 0.65);
  drawLakeDock(ctx, 5, 310, 175, 0.65);
  drawLakeDock(ctx, 795, 308, 165, 0.62);
  drawLakeIsland(ctx, 575, 345);
  for (let i = 0; i < 60; i++) {
    const y = 300 + ((i * 31) % 220);
    ctx.fillStyle = i % 3 ? "#8fa8c844" : "#e7dbf255";
    ctx.fillRect(
      (i * 137 + Math.sin(time * 0.7 + i) * 8) % VIEW.width,
      y,
      12 + (i % 6) * 5,
      2,
    );
  }
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#f2b45c";
  for (const reflection of [58, 904]) {
    for (let row = 0; row < 22; row += 5) {
      const width = 4 + ((row / 5) % 3) * 5;
      ctx.fillRect(reflection - width / 2, 320 + row, width, 2);
    }
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#102b26";
  ctx.beginPath();
  ctx.moveTo(0, 440);
  ctx.lineTo(170, 400);
  ctx.lineTo(325, 443);
  ctx.lineTo(485, VIEW.height);
  ctx.lineTo(0, VIEW.height);
  ctx.fill();
  for (let i = 0; i < 18; i++) {
    const treeX = i * 22 - 18;
    if (treeX >= 22 && treeX <= 258) continue;
    drawLakePine(
      ctx,
      treeX,
      470 + (i % 3) * 10,
      42 + (i % 4) * 8,
      18 + (i % 3) * 4,
      {
        trunk: "#10231f",
        0: "#102d27",
        1: "#153b2e",
        2: "#1c4935",
        highlight: "#2c6043",
      },
    );
  }
  drawLakeDock(ctx, 40, 446, 200, 1.1);
  drawCharacter(ctx, 173, 441, time, false, "right");
  ctx.strokeStyle = "#241c30";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(197, 420);
  ctx.quadraticCurveTo(284, 350 - tug, rodTip.x, rodTip.y);
  ctx.stroke();
  ctx.strokeStyle = "#cfe0f0aa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rodTip.x, rodTip.y);
  ctx.quadraticCurveTo(340, 335, lineX, lineY);
  ctx.stroke();
  if (cast) {
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
  ctx.fillStyle = "#ffdca8";
  ctx.fillRect(35, 44, 3, 3);
  ctx.fillRect(48, 72, 2, 2);
  ctx.fillRect(815, 58, 3, 3);
}

export function canCastAt(x, y) {
  if (y < 310) return false;
  if ((x <= 180 && y <= 335) || (x >= 795 && y <= 333)) return false;
  if (x >= 510 && x <= 640 && y >= 285 && y <= 355) return false;
  if (x < 170 && y >= 440 - (40 * x) / 170) return false;
  if (x < 325 && y >= 400 + (43 * (x - 170)) / 155) return false;
  if (x < 485 && y >= 443 + (97 * (x - 325)) / 160) return false;
  if (x >= 40 && x <= 240 && y >= 446 && y <= 490) return false;
  return true;
}
