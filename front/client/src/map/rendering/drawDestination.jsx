import { VIEW } from "../mapData.js";
import { drawTree, drawShop } from "../terrain/terrainSprites.jsx";
import { drawCharacter, drawPlayerName } from "./mapSprites.jsx";
import { drawFishingScene } from "./drawFishingScene.js";

export function drawDestination(ctx, location, time, state, remotePlayers) {
  if (location.type === "lake") {
    drawFishingScene(ctx, location, time, state.fishing, state.platformId, state.playerName, remotePlayers, state.spotIndex);
    return;
  }
  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, "#173346");
  sky.addColorStop(1, "#a9b8a1");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = "#dad9aa";
  ctx.fillRect(153, 113, 42, 40);
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = i % 2 ? "#4d736b" : "#608780";
    ctx.beginPath();
    ctx.moveTo(i * 140 - 90, 279);
    ctx.lineTo(i * 140 + 10, 164 + (i % 3) * 19);
    ctx.lineTo(i * 140 + 143, 280);
    ctx.fill();
  }
  ctx.fillStyle = "#466644";
  ctx.fillRect(0, 246, VIEW.width, VIEW.height);
  for (let i = 0; i < 66; i++)
    drawTree(ctx, i * 16, 273 + Math.sin(i * 2) * 9, 1.4 + (i % 4) * 0.25);
  if (location.type === "shop") {
    ctx.fillStyle = "#84956a";
    ctx.fillRect(0, 300, 960, 240);
    ctx.fillStyle = "#c1b183";
    ctx.beginPath();
    ctx.moveTo(250, 375);
    ctx.lineTo(340, 375);
    ctx.lineTo(485, 540);
    ctx.lineTo(155, 540);
    ctx.fill();
    drawShop(ctx, 291, 339, 5.4);
    for (let i = 0; i < 7; i++)
      drawTree(ctx, 46 + i * 74, 430 + Math.sin(i) * 55, 2.2);
    drawCharacter(ctx, 313, 454, time, false, "up");
  } else {
    const water = ctx.createLinearGradient(0, 281, 0, 540);
    water.addColorStop(0, "#629b9c");
    water.addColorStop(1, "#163f57");
    ctx.fillStyle = water;
    ctx.fillRect(0, 282, 960, 258);
    if (location.type === "river") {
      ctx.fillStyle = "#648558";
      ctx.beginPath();
      ctx.moveTo(0, 280);
      ctx.lineTo(200, 285);
      ctx.lineTo(420, 540);
      ctx.lineTo(0, 540);
      ctx.fill();
    }
    if (location.type === "waterfall") {
      ctx.fillStyle = "#5c7972";
      ctx.fillRect(164, 227, 184, 88);
      ctx.fillStyle = "#b5e2d6";
      ctx.fillRect(214, 224, 54, 131);
      ctx.fillStyle = "#e0efce";
      for (let i = 0; i < 7; i++)
        ctx.fillRect(218 + i * 7, 230 + Math.sin(time * 2 + i) * 4, 3, 119);
      ctx.fillStyle = "#c5e5d780";
      ctx.beginPath();
      ctx.ellipse(241, 359, 68, 12, 0, 0, 7);
      ctx.fill();
    }
    for (let i = 0; i < 85; i++) {
      ctx.fillStyle = i % 3 ? "#b0d6c442" : "#87b9b75e";
      ctx.fillRect(
        (i * 113 + Math.sin(time + i) * 6) % 960,
        296 + ((i * 19) % 230),
        12 + (i % 7) * 4,
        2,
      );
    }
    ctx.fillStyle = "#344c37";
    ctx.beginPath();
    ctx.moveTo(0, 440);
    ctx.lineTo(77, 410);
    ctx.lineTo(162, 449);
    ctx.lineTo(290, 540);
    ctx.lineTo(0, 540);
    ctx.fill();
    ctx.fillStyle = "#9e865e";
    ctx.fillRect(98, 416, 228, 16);
    ctx.fillRect(130, 432, 8, 48);
    ctx.fillRect(302, 432, 8, 45);
    ctx.fillStyle = "#67583e";
    for (let x = 105; x < 326; x += 13) ctx.fillRect(x, 416, 2, 16);
    drawCharacter(ctx, 275, 406, time, false, "right");
    for (let i = 0; i < 10; i++)
      drawTree(ctx, i * 15 - 15, 462 + (i % 3) * 10, 2.8);
  }
  const player = location.type === "shop" ? { x: 313, y: 454 } : { x: 275, y: 406 };
  drawPlayerName(ctx, state.playerName, player.x, player.y);
}
