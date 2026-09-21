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
  "M1040 174 Q1009 196 1018 222 Q1027 252 996 275 Q968 296 973 310 Q981 333 996 353 Q1014 379 1000 412 Q985 448 969 463";
const entry = (id) => LOCATIONS.find((place) => place.id === id).entry;
const trail = (...points) =>
  points
    .map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`)
    .join(" ");
const TRAILS = [
  trail(
    entry("quiet-lake"),
    CLEARINGS[0],
    { x: 3572, y: 1410 },
    entry("angler-shop"),
    CLEARINGS[1],
  ),
  trail(
    CLEARINGS[0],
    { x: 3730, y: 1290 },
    entry("silver-river"),
    { x: 3880, y: 1334 },
    { x: 4035, y: 1334 },
    entry("pine-lake"),
  ),
  trail(entry("silver-river"), { x: 3880, y: 1090 }, entry("mist-falls")),
  trail(
    { x: 4035, y: 1334 },
    { x: 4280, y: 1170 },
    CLEARINGS[2],
    entry("riverside-shop"),
  ),
  trail(entry("angler-shop"), { x: 3420, y: 1550 }, entry("reed-lake")),
  trail(
    CLEARINGS[1],
    { x: 3610, y: 1700 },
    { x: 3610, y: 1845 },
    entry("sunset-lake"),
    entry("southern-shop"),
    CLEARINGS[3],
  ),
  trail(
    entry("riverside-shop"),
    { x: 4680, y: 1186 },
    { x: 4680, y: 1326 },
    entry("meadow-lake"),
  ),
  trail(CLEARINGS[2], { x: 4410, y: 945 }, entry("highland-lake")),
  trail(entry("highland-lake"), { x: 4730, y: 878 }, entry("eastern-shop")),
  trail(entry("riverside-shop"), { x: 4710, y: 1130 }, entry("eastern-shop")),
];
export const BRIDGES = [{ x: 3880, y: 1318, width: 155, height: 32 }];

export function createTerrainGeometry() {
  const paths = CONTINENTS.map((data) => new Path2D(data));
  const river = new Path2D(RIVER);
  const trails = TRAILS.map((data) => new Path2D(data));
  const lakes = LOCATIONS.filter((spot) => spot.type === "lake").map((spot) => {
    const path = new Path2D();
    path.ellipse(
      spot.x,
      spot.y,
      spot.radiusX,
      spot.radiusY,
      -0.35,
      0,
      Math.PI * 2,
    );
    return { spot, path };
  });

  return { paths, river, trails, lakes };
}
