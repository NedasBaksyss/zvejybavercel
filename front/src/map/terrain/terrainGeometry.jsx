import { LOCATIONS, CLEARINGS } from "../mapData.js";

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
const RIVER =
  "M1040 174 Q1009 196 1018 222 Q1027 252 996 275 Q968 296 973 310 Q981 333 996 353 Q1014 379 1000 412 Q999 416 998 422";
const entry = (id) => LOCATIONS.find((place) => place.id === id).entry;
// Round bends without overshooting the route anchors or the bridge approaches.
const trail = (...points) => {
  let data = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i - 1], point = points[i], next = points[i + 1];
    const radius = Math.min(100, Math.hypot(point.x - previous.x, point.y - previous.y) / 4,
      Math.hypot(next.x - point.x, next.y - point.y) / 4);
    const before = radius / Math.hypot(point.x - previous.x, point.y - previous.y);
    const after = radius / Math.hypot(next.x - point.x, next.y - point.y);
    // Keep the entire bridge deck straight.
    if (point.y === 1334 || [westFork, eastFork, southFork, ...CLEARINGS,
      entry("angler-shop"), entry("riverside-shop")].some((junction) =>
      point.x === junction.x && point.y === junction.y)) { data += ` L${point.x} ${point.y}`; continue; }
    data += ` L${point.x + (previous.x - point.x) * before} ${point.y + (previous.y - point.y) * before}`;
    data += ` Q${point.x} ${point.y} ${point.x + (next.x - point.x) * after} ${point.y + (next.y - point.y) * after}`;
  }
  return data + ` L${points.at(-1).x} ${points.at(-1).y}`;
};
// A western woodland loop and an eastern ridge trail meet at the river bridge.
const westFork = { x: 3660, y: 1300 };
const eastFork = { x: 4160, y: 1230 };
const southFork = { x: 3660, y: 1680 };
const TRAILS = [
  trail(entry("quiet-lake"), CLEARINGS[0], { x: 3560, y: 1270 }, westFork,
    { x: 3800, y: 1280 }, { x: 3880, y: 1334 }, { x: 4035, y: 1334 }, eastFork),
  trail(westFork, { x: 3620, y: 1400 }, entry("angler-shop"), CLEARINGS[1],
    { x: 3590, y: 1600 }, southFork, { x: 3670, y: 1900 }, { x: 3590, y: 1940 }, entry("sunset-lake"),
    entry("southern-shop"), CLEARINGS[3]),
  trail(entry("angler-shop"), entry("reed-lake"), { x: 3420, y: 1600 },
    { x: 3490, y: 1690 }, southFork),
  trail(westFork, { x: 3780, y: 1190 }, entry("silver-river")),
  trail({ x: 3780, y: 1190 }, { x: 3780, y: 1050 }, { x: 3920, y: 970 }, entry("mist-falls")),
  trail(eastFork, { x: 4230, y: 1130 }, CLEARINGS[2], entry("riverside-shop"), entry("meadow-lake")),
  trail(eastFork, { x: 4110, y: 1320 }, entry("pine-lake")),
  trail(CLEARINGS[2], { x: 4320, y: 1020 }, entry("highland-lake")),
  trail(entry("highland-lake"), { x: 4650, y: 990 }, { x: 4780, y: 960 }, entry("eastern-shop")),
];
export const BRIDGES = [{ x: 3880, y: 1318, width: 155, height: 32 }];

export function createTerrainGeometry() {
  const paths = CONTINENTS.map((data, index) => {
    // Small coves along the original coast preserve the world layout.
    const coordinates = data.match(/-?\d+(?:\.\d+)?/g).map(Number);
    const points = [];
    for (let i = 0; i < coordinates.length; i += 2) {
      const x = coordinates[i], y = coordinates[i + 1];
      const nx = coordinates[(i + 2) % coordinates.length], ny = coordinates[(i + 3) % coordinates.length];
      const length = Math.hypot(nx - x, ny - y), steps = Math.ceil(length / 5);
      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const offset = Math.sin(t * Math.PI) * (Math.sin(j * 1.7 + i) * 1.1 + Math.sin(j * .63 + index) * 1.5);
        points.push([x + (nx - x) * t - (ny - y) / length * offset,
          y + (ny - y) * t + (nx - x) / length * offset]);
      }
    }
    const path = new Path2D();
    path.moveTo((points.at(-1)[0] + points[0][0]) / 2, (points.at(-1)[1] + points[0][1]) / 2);
    points.forEach(([x, y], i) => {
      const next = points[(i + 1) % points.length];
      path.quadraticCurveTo(x, y, (x + next[0]) / 2, (y + next[1]) / 2);
    });
    path.closePath();
    return path;
  });
  const river = new Path2D(RIVER);
  const trails = TRAILS.map((data) => new Path2D(data));
  const lakes = LOCATIONS.filter((spot) => spot.type === "lake").map((spot) => {
    const path = new Path2D();
    for (let i = 0; i <= 96; i++) {
      const angle = i / 96 * Math.PI * 2;
      const radius = .88 + .12 * Math.sin(angle * 3 + spot.x) + .055 * Math.cos(angle * 5 + spot.y);
      const x = Math.cos(angle) * spot.radiusX * radius;
      const y = Math.sin(angle) * spot.radiusY * radius;
      const px = spot.x + x * Math.cos(spot.rotation) - y * Math.sin(spot.rotation);
      const py = spot.y + x * Math.sin(spot.rotation) + y * Math.cos(spot.rotation);
      if (i === 0) path.moveTo(px, py); else path.lineTo(px, py);
    }
    path.closePath();
    return { spot, path };
  });

  return { paths, river, trails, lakes };
}
