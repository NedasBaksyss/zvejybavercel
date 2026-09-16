import { WORLD, WORLD_TEXTURE, WORLD_SCALE, LOCATIONS, CLEARINGS, clamp } from "./mapData.js";

const CONTINENTS = [
  "M125 154 L195 106 290 125 337 164 425 151 474 209 437 257 365 269 351 315 308 330 299 383 256 349 223 287 157 268 122 205Z",
  "M310 396 L361 371 419 389 470 437 451 488 414 513 404 583 362 662 338 643 324 566 292 505 288 444Z",
  "M748 219 L776 169 846 157 865 115 899 131 917 165 1006 146 1080 163 1150 138 1257 156 1373 183 1426 230 1385 275 1318 283 1283 336 1221 321 1195 378 1142 406 1131 450 1084 419 1030 436 994 410 940 428 918 490 884 559 854 553 830 490 790 453 785 390 755 351 782 304 739 273Z",
  "M1259 530 L1327 505 1395 526 1418 581 1370 605 1307 592 1260 608 1234 569Z",
  "M580 93 L616 80 651 111 622 166 585 144Z",
  "M971 483 L989 482 984 542 963 566 959 526Z",
  "M1426 638 L1443 615 1455 626 1440 664 1421 679Z",
  "M0 744 L90 726 218 750 344 720 483 743 640 721 801 740 943 715 1091 739 1250 717 1424 742 1552 721 1600 738 1600 800 0 800Z",
];
const RIVER = "M1040 174 Q1009 196 1018 222 Q1027 252 996 275 Q968 296 973 310 Q981 333 996 353 Q1014 379 1000 412 Q985 448 969 463";
const entry = (id) => LOCATIONS.find((place) => place.id === id).entry;
const trail = (...points) => points.map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`).join(" ");
const TRAILS = [
  trail(entry("quiet-lake"), CLEARINGS[0], { x: 3572, y: 1410 }, entry("angler-shop"), CLEARINGS[1]),
  trail(CLEARINGS[0], { x: 3730, y: 1290 }, entry("silver-river"), { x: 3880, y: 1334 }, { x: 4035, y: 1334 }, entry("pine-lake")),
  trail(entry("silver-river"), { x: 3880, y: 1090 }, entry("mist-falls")),
  trail({ x: 4035, y: 1334 }, { x: 4280, y: 1170 }, CLEARINGS[2], entry("riverside-shop")),
  trail(entry("angler-shop"), { x: 3420, y: 1550 }, entry("reed-lake")),
  trail(CLEARINGS[1], { x: 3610, y: 1700 }, { x: 3610, y: 1845 }, entry("sunset-lake"), entry("southern-shop"), CLEARINGS[3]),
  trail(entry("riverside-shop"), { x: 4680, y: 1186 }, { x: 4680, y: 1326 }, entry("meadow-lake")),
  trail(CLEARINGS[2], { x: 4410, y: 945 }, entry("highland-lake")),
  trail(entry("highland-lake"), { x: 4730, y: 878 }, entry("eastern-shop")),
  trail(entry("riverside-shop"), { x: 4710, y: 1130 }, entry("eastern-shop")),
];
const BRIDGES = [{ x: 3880, y: 1318, width: 155, height: 32 }];
const TILE_SIZE = 512;
const MAX_TILES = 24;

function makeCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function noise(x, y, salt = 0) {
  let value = Math.imul(x ^ 1597334677, 2246822519) ^ Math.imul(y ^ salt, 3266489917);
  value = Math.imul(value ^ (value >>> 16), 2246822519);
  return ((value ^ (value >>> 13)) >>> 0) / 4294967296;
}

export function drawTree(ctx, x, y, size = 1) {
  ctx.fillStyle = "#213d33";
  ctx.fillRect(x - 1 * size, y, 2 * size, 4 * size);
  ctx.fillStyle = "#234e3d";
  ctx.beginPath(); ctx.moveTo(x, y - 13 * size); ctx.lineTo(x - 6 * size, y + size); ctx.lineTo(x + 6 * size, y + size); ctx.fill();
  ctx.fillStyle = "#397051";
  ctx.beginPath(); ctx.moveTo(x, y - 13 * size); ctx.lineTo(x - 6 * size, y + size); ctx.lineTo(x, y - size); ctx.fill();
  ctx.fillStyle = "#4c8058";
  ctx.fillRect(x - size, y - 8 * size, size, 3 * size);
}

export function drawShop(ctx, x, y, size = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size, size);
  ctx.fillStyle = "#264636"; ctx.fillRect(-13, 2, 29, 9);
  ctx.fillStyle = "#d4bc82"; ctx.fillRect(-11, -13, 22, 22);
  ctx.fillStyle = "#8c624a"; ctx.fillRect(-12, -12, 24, 3);
  ctx.fillStyle = "#ad6948"; ctx.beginPath(); ctx.moveTo(-15, -12); ctx.lineTo(0, -25); ctx.lineTo(15, -12); ctx.fill();
  ctx.fillStyle = "#d89258"; ctx.beginPath(); ctx.moveTo(-15, -12); ctx.lineTo(0, -25); ctx.lineTo(0, -12); ctx.fill();
  ctx.fillStyle = "#563c31"; ctx.fillRect(-3, -3, 6, 12);
  ctx.fillStyle = "#2d6b75"; ctx.fillRect(-9, -7, 4, 5); ctx.fillRect(5, -7, 4, 5);
  ctx.fillStyle = "#f2cf86"; ctx.fillRect(-9, -7, 3, 2); ctx.fillRect(5, -7, 3, 2);
  ctx.fillStyle = "#927048"; ctx.fillRect(-7, 9, 14, 3);
  ctx.restore();
}

export function createTerrain() {
  const paths = CONTINENTS.map((data) => new Path2D(data));
  const river = new Path2D(RIVER);
  const trails = TRAILS.map((data) => new Path2D(data));
  const lakes = LOCATIONS.filter((spot) => spot.type === "lake").map((spot) => {
    const path = new Path2D();
    path.ellipse(spot.x, spot.y, spot.radiusX, spot.radiusY, -0.35, 0, Math.PI * 2);
    return { spot, path };
  });
  const mask = makeCanvas(WORLD_TEXTURE.width, WORLD_TEXTURE.height);
  const collision = mask.getContext("2d", { willReadFrequently: true });
  collision.fillStyle = "black"; collision.fillRect(0, 0, mask.width, mask.height);
  collision.fillStyle = "white"; paths.forEach((path) => collision.fill(path));
  collision.lineCap = "round"; collision.strokeStyle = "black";
  collision.lineWidth = 24 / WORLD_SCALE; collision.stroke(river);
  collision.save(); collision.scale(1 / WORLD_SCALE, 1 / WORLD_SCALE);
  collision.fillStyle = "black"; lakes.forEach(({ path }) => collision.fill(path));
  collision.fillStyle = "white";
  BRIDGES.forEach((bridge) => collision.fillRect(bridge.x, bridge.y, bridge.width, bridge.height));
  collision.restore();
  const rgba = collision.getImageData(0, 0, mask.width, mask.height).data;
  const walkable = new Uint8Array(mask.width * mask.height);
  for (let i = 0; i < walkable.length; i++) walkable[i] = rgba[i * 4] > 180 ? 1 : 0;
  const land = (x, y) => x >= 0 && y >= 0 && x < WORLD.width && y < WORLD.height &&
    walkable[Math.floor(y / WORLD_SCALE) * WORLD_TEXTURE.width + Math.floor(x / WORLD_SCALE)] === 1;
  // A small collision mask and bounded tile cache keep memory independent of a full-size world image.
  mask.width = mask.height = 1;
  const hit = makeCanvas(1, 1).getContext("2d");
  hit.lineWidth = 30; hit.lineCap = "round";
  const intersects = (bounds, x, y, radius) => x + radius >= bounds.x && x - radius <= bounds.x + bounds.width && y + radius >= bounds.y && y - radius <= bounds.y + bounds.height;

  function paintGround(ctx, bounds) {
    ctx.fillStyle = "#153e55"; ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.save(); ctx.scale(WORLD_SCALE, WORLD_SCALE);
    for (const path of paths) {
      ctx.strokeStyle = "#246875"; ctx.lineWidth = 6; ctx.stroke(path);
      ctx.strokeStyle = "#5b9290"; ctx.lineWidth = 2.5; ctx.stroke(path);
      ctx.strokeStyle = "#bec48a"; ctx.lineWidth = 1.2; ctx.stroke(path);
      ctx.fillStyle = "#688958"; ctx.fill(path);
      ctx.save(); ctx.clip(path);
      ctx.fillStyle = "#8b9b64"; ctx.fillRect(0, 400, 1600, 85);
      ctx.fillStyle = "#718752"; ctx.fillRect(0, 485, 1600, 70);
      ctx.fillStyle = "#dce0c8"; ctx.fillRect(0, 0, 1600, 124); ctx.fillRect(0, 735, 1600, 65);
      ctx.restore();
    }
    ctx.restore();
    for (let gy = Math.floor((bounds.y - 48) / 48); gy <= Math.ceil((bounds.y + bounds.height + 48) / 48); gy++) {
      for (let gx = Math.floor((bounds.x - 48) / 48); gx <= Math.ceil((bounds.x + bounds.width + 48) / 48); gx++) {
        const x = gx * 48 + noise(gx, gy) * 30, y = gy * 48 + noise(gx, gy, 12) * 30;
        ctx.fillStyle = land(x, y) ? (noise(gx, gy, 7) > 0.5 ? "#b7be7d22" : "#3f724d28") : "#7cabb320";
        ctx.fillRect(x, y, 10 + noise(gx, gy, 8) * 17, land(x, y) ? 4 : 1);
      }
    }
    ctx.save(); ctx.scale(WORLD_SCALE, WORLD_SCALE);
    ctx.lineCap = "round";
    ctx.strokeStyle = "#abb480"; ctx.lineWidth = 34 / WORLD_SCALE; ctx.stroke(river);
    ctx.strokeStyle = "#398c93"; ctx.lineWidth = 24 / WORLD_SCALE; ctx.stroke(river);
    ctx.strokeStyle = "#256a80"; ctx.lineWidth = 14 / WORLD_SCALE; ctx.stroke(river);
    ctx.restore();
    for (const { spot, path } of lakes) {
      if (!intersects(bounds, spot.x, spot.y, spot.radiusX + 15)) continue;
      ctx.strokeStyle = "#b5bb83"; ctx.lineWidth = 10; ctx.stroke(path);
      ctx.fillStyle = "#398c93"; ctx.fill(path);
      ctx.save(); ctx.clip(path);
      ctx.fillStyle = "#266a83"; ctx.beginPath();
      ctx.ellipse(spot.x - 5, spot.y - 6, spot.radiusX * 0.82, spot.radiusY * 0.8, -0.35, 0, 7); ctx.fill();
      ctx.fillStyle = "#75b8b0";
      for (let i = 0; i < 60; i++) ctx.fillRect(spot.x + (noise(spot.x, i) - 0.5) * spot.radiusX * 2,
        spot.y + (noise(i, spot.y) - 0.5) * spot.radiusY * 2, 3 + i % 8, 1);
      ctx.restore();
    }
    for (const clearing of CLEARINGS) {
      if (!intersects(bounds, clearing.x, clearing.y, clearing.radius)) continue;
      ctx.fillStyle = "#a8aa70"; ctx.beginPath(); ctx.ellipse(clearing.x, clearing.y, clearing.radius, clearing.radius * 0.74, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = "#c6b67d"; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = "#bdad76"; ctx.fillRect(clearing.x - 18, clearing.y - 6, 36, 12);
    }
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const path of trails) {
      ctx.strokeStyle = "#60764b"; ctx.lineWidth = 22; ctx.stroke(path);
      ctx.strokeStyle = "#b6ae79"; ctx.lineWidth = 16; ctx.stroke(path);
      ctx.strokeStyle = "#d7c48c"; ctx.lineWidth = 2; ctx.stroke(path);
    }
    for (const bridge of BRIDGES) {
      ctx.fillStyle = "#735f43"; ctx.fillRect(bridge.x, bridge.y, bridge.width, bridge.height);
      for (let x = bridge.x + 3; x < bridge.x + bridge.width - 3; x += 5) {
        ctx.fillStyle = "#c7a274"; ctx.fillRect(x, bridge.y + 3, 4, bridge.height - 6);
      }
      ctx.fillStyle = "#514a38"; ctx.fillRect(bridge.x - 2, bridge.y, bridge.width + 4, 2);
      ctx.fillRect(bridge.x - 2, bridge.y + bridge.height - 2, bridge.width + 4, 2);
    }
  }

  function paintDetails(ctx, bounds) {
    const cell = 28;
    for (let gy = Math.floor((bounds.y - 24) / cell); gy <= Math.ceil((bounds.y + bounds.height + 24) / cell); gy++) {
      for (let gx = Math.floor((bounds.x - 24) / cell); gx <= Math.ceil((bounds.x + bounds.width + 24) / cell); gx++) {
        if (noise(gx, gy, 18) < 0.48) continue;
        const x = gx * cell + noise(gx, gy, 2) * 22, y = gy * cell + noise(gx, gy, 3) * 22;
        if (!land(x, y) || LOCATIONS.some((place) => Math.hypot(x - place.entry.x, y - place.entry.y) < 42) ||
          CLEARINGS.some((clearing) => Math.hypot(x - clearing.x, y - clearing.y) < clearing.radius + 15) ||
          trails.some((path) => hit.isPointInStroke(path, x, y))) continue;
        drawTree(ctx, x, y, 0.7 + noise(gx, gy, 4) * 0.7);
      }
    }
    for (let i = 0; i < 25; i++) {
      const x = 3830 + i * 35, y = 692 + Math.sin(i * 1.5) * 44;
      if (!intersects(bounds, x, y, 38)) continue;
      ctx.fillStyle = "#567264"; ctx.beginPath(); ctx.moveTo(x, y - 38); ctx.lineTo(x - 27, y + 10); ctx.lineTo(x + 29, y + 10); ctx.fill();
      ctx.fillStyle = "#91a18a"; ctx.beginPath(); ctx.moveTo(x, y - 38); ctx.lineTo(x - 27, y + 10); ctx.lineTo(x, y + 4); ctx.fill();
      ctx.fillStyle = "#d8dfc8"; ctx.beginPath(); ctx.moveTo(x, y - 38); ctx.lineTo(x - 8, y - 22); ctx.lineTo(x + 8, y - 23); ctx.fill();
    }
    for (const place of LOCATIONS) {
      if (!intersects(bounds, place.x, place.y, 140)) continue;
      if (place.type === "shop") drawShop(ctx, place.x, place.y, 1.1);
      if (place.type === "waterfall") {
        ctx.fillStyle = "#658875"; ctx.fillRect(place.x - 22, place.y - 18, 44, 20);
        ctx.fillStyle = "#b1e2da"; ctx.fillRect(place.x - 8, place.y - 23, 16, 38);
        ctx.fillStyle = "#ecf1d3"; ctx.fillRect(place.x - 4, place.y - 23, 4, 38); ctx.fillRect(place.x - 14, place.y + 15, 28, 4);
      }
      if (place.type === "lake") {
        ctx.fillStyle = "#a88a54"; ctx.fillRect(place.entry.x - 5, place.entry.y - 17, 10, 21);
        ctx.fillStyle = "#655234";
        for (let y = 0; y < 20; y += 4) ctx.fillRect(place.entry.x - 5, place.entry.y - 16 + y, 10, 1);
      }
    }
  }

  const canvas = makeCanvas(WORLD_TEXTURE.width, WORLD_TEXTURE.height);
  const overview = canvas.getContext("2d", { willReadFrequently: true });
  overview.scale(1 / WORLD_SCALE, 1 / WORLD_SCALE);
  const worldBounds = { x: 0, y: 0, width: WORLD.width, height: WORLD.height };
  paintGround(overview, worldBounds); paintDetails(overview, worldBounds);
  const pixels = overview.getImageData(0, 0, canvas.width, canvas.height).data;
  const tiles = new Map();
  function getTile(tx, ty) {
    const key = `${tx}:${ty}`;
    if (tiles.has(key)) { const tile = tiles.get(key); tiles.delete(key); tiles.set(key, tile); return tile; }
    const tile = makeCanvas(TILE_SIZE, TILE_SIZE);
    const context = tile.getContext("2d");
    context.translate(-tx * TILE_SIZE, -ty * TILE_SIZE);
    const bounds = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
    paintGround(context, bounds); paintDetails(context, bounds);
    tiles.set(key, tile);
    if (tiles.size > MAX_TILES) { const first = tiles.keys().next().value; const old = tiles.get(first); tiles.delete(first); old.width = old.height = 1; }
    return tile;
  }

  return {
    canvas, pixels,
    textureWidth: WORLD_TEXTURE.width, textureHeight: WORLD_TEXTURE.height,
    draw(ctx, camera, zoom, width, height) {
      const left = camera.x - width / zoom / 2, top = camera.y - height / zoom / 2;
      if (zoom < 0.55) { ctx.drawImage(canvas, -left * zoom, -top * zoom, WORLD.width * zoom, WORLD.height * zoom); return; }
      const x1 = Math.max(0, Math.floor(left / TILE_SIZE)), y1 = Math.max(0, Math.floor(top / TILE_SIZE));
      const x2 = Math.min(Math.ceil(WORLD.width / TILE_SIZE) - 1, Math.floor((left + width / zoom) / TILE_SIZE));
      const y2 = Math.min(Math.ceil(WORLD.height / TILE_SIZE) - 1, Math.floor((top + height / zoom) / TILE_SIZE));
      for (let ty = y1; ty <= y2; ty++) for (let tx = x1; tx <= x2; tx++) {
        const tile = getTile(tx, ty), x = tx * TILE_SIZE, y = ty * TILE_SIZE;
        const w = Math.min(TILE_SIZE, WORLD.width - x), h = Math.min(TILE_SIZE, WORLD.height - y);
        const dx = Math.round((x - left) * zoom), dy = Math.round((y - top) * zoom);
        const dw = Math.round((x + w - left) * zoom) - dx, dh = Math.round((y + h - top) * zoom) - dy;
        ctx.drawImage(tile, 0, 0, w, h, dx, dy, dw, dh);
      }
    },
    canWalk(x, y) { return [[0, 0], [-5, 0], [5, 0], [0, -5], [0, 5]].every(([dx, dy]) => land(x + dx, y + dy)); },
    clampPosition(point) { return { x: clamp(point.x, 6, WORLD.width - 6), y: clamp(point.y, 6, WORLD.height - 6) }; },
    cacheInfo: () => ({ tiles: tiles.size, limit: MAX_TILES, collisionBytes: walkable.byteLength }),
    dispose() { for (const tile of tiles.values()) tile.width = tile.height = 1; tiles.clear(); canvas.width = canvas.height = 1; },
  };
}
