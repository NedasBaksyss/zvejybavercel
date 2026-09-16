export const WORLD_SCALE = 4;
export const WORLD = { width: 6400, height: 3200 };
export const WORLD_TEXTURE = { width: 1600, height: 800 };
export const MAP_VERSION = 2;
export const VIEW = { width: 960, height: 540 };
export const SPAWN = { x: 3475, y: 1210 };
export const LOCAL_ZOOM = 2.4;
export const MIN_ZOOM = 0.09;
export const MAX_ZOOM = 3.8;
export const INTERACTION_DISTANCE = 34;
export const WALK_SPEED = 100;
export const RUN_SPEED = 170;
export const GLOBE_START = 0.24;
export const GLOBE_END = 0.12;
export const GLOBE_SWITCH = 0.1875;

export const LOCATIONS = [
  {
    id: "quiet-lake",
    type: "lake",
    x: 3360,
    y: 1100,
    radiusX: 72,
    radiusY: 48,
    entry: { x: 3418, y: 1150 },
    name: { LT: "Tylusis ežeras", EN: "Quiet Lake" },
    description: {
      LT: "Nendrių apsuptas ežeras ir senas medinis lieptas.",
      EN: "A reed-lined lake with an old wooden jetty.",
    },
    possibleFish: ["carp", "perch", "pike"],
  },
  {
    id: "angler-shop",
    type: "shop",
    x: 3572,
    y: 1516,
    entry: { x: 3572, y: 1538 },
    name: { LT: "Žvejo krautuvė", EN: "Angler's Supply" },
    description: {
      LT: "Meškerės, masalai ir įranga kitai kelionei.",
      EN: "Rods, bait and tackle for the next trip.",
    },
    possibleFish: [],
  },
  {
    id: "silver-river",
    type: "river",
    x: 3892,
    y: 1240,
    entry: { x: 3856, y: 1248 },
    name: { LT: "Sidabrinė upė", EN: "Silver River" },
    description: {
      LT: "Srauni upė, tekanti nuo šiaurinių kalnų.",
      EN: "A winding river flowing down from the northern hills.",
    },
    possibleFish: ["salmon", "trout"],
  },
  {
    id: "mist-falls",
    type: "waterfall",
    x: 4072,
    y: 888,
    entry: { x: 4036, y: 912 },
    name: { LT: "Rūko krioklys", EN: "Mist Falls" },
    description: {
      LT: "Skaidrus kalnų vanduo krinta į gilų baseiną.",
      EN: "Clear mountain water cascades into a deep pool.",
    },
    possibleFish: ["trout", "salmon"],
  },
];

export const CLEARINGS = [
  { ...SPAWN, radius: 72 },
  { x: 3572, y: 1590, radius: 78 },
  { x: 4420, y: 1120, radius: 85 },
  { x: 3410, y: 1960, radius: 70 },
];

export function regionName(player, language) {
  if (player.y < 1000)
    return language === "LT" ? "Šiaurinės aukštumos" : "Northern highlands";
  if (player.y > 1650)
    return language === "LT" ? "Pietų pakrantė" : "The southern coast";
  if (player.x > 4300)
    return language === "LT" ? "Rytinės pievos" : "Eastern meadows";
  return language === "LT" ? "Šiaurės pakrantė" : "The northern coast";
}

export const MAP_TEXT = {
  LT: {
    title: "ŽVEJO ATLASAS",
    local: "Šiaurės pakrantė",
    world: "Pasaulio gaublys",
    map: "Žemėlapis",
    globe: "Gaublys",
    places: "VIETOVĖS",
    you: "Tavo vieta",
    lake: "Ežeras",
    river: "Upė",
    waterfall: "Krioklys",
    shop: "Parduotuvė",
    move: "WASD · judėti / Shift · bėgti",
    zoom: "Ratukas · mastelis",
    interact: "Dešinysis pelės / E · įeiti",
    placesButton: "Vietos",
    showPlaces: "Atidaryti vietų sąrašą",
    hidePlaces: "Uždaryti vietų sąrašą",
    rotate: "Tempk · sukti gaublį",
    returnMap: "Artink arba spausk „Žemėlapis“",
    approach: "Prieik prie pažymėtos vietos",
    enter: "Įeiti",
    back: "Grįžti į žemėlapį",
    nearby: "NETOLIESE",
    focus: "Rodyti mano vietą",
    pause: "Pauzė",
    zoomIn: "Priartinti",
    zoomOut: "Atitolinti",
    selected: "Pasirinkta",
    arrived: "ATVYKAI",
    fish: "ČIA GYVENA",
    supplies: "KRAUTUVĖ",
    stock: "Meškerės · masalai · įranga",
    distance: "žingsnių",
    canvas:
      "Žemėlapis. Judėk WASD, artink ir tolink ratuku. E atveria artimiausią vietą.",
    globeNote: "Žemėlapio vietos išlieka tos pačios",
    listHint: "Pasirink vietą, kad ją pažymėtum.",
    fishNames: {
      carp: "Karpis",
      perch: "Ešerys",
      pike: "Lydeka",
      salmon: "Lašiša",
      trout: "Upėtakis",
    },
  },
  EN: {
    title: "ANGLER'S ATLAS",
    local: "The northern coast",
    world: "World globe",
    map: "Map",
    globe: "Globe",
    places: "LOCATIONS",
    you: "You are here",
    lake: "Lake",
    river: "River",
    waterfall: "Waterfall",
    shop: "Shop",
    move: "WASD · move / Shift · run",
    zoom: "Scroll · zoom",
    interact: "Right click / E · enter",
    placesButton: "Locations",
    showPlaces: "Open the location list",
    hidePlaces: "Close the location list",
    rotate: "Drag · rotate globe",
    returnMap: "Zoom in or choose Map",
    approach: "Walk to the highlighted location",
    enter: "Enter",
    back: "Back to the map",
    nearby: "NEARBY",
    focus: "Find my character",
    pause: "Pause",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    selected: "Selected",
    arrived: "YOU HAVE ARRIVED",
    fish: "LOCAL SPECIES",
    supplies: "TACKLE SHOP",
    stock: "Rods · bait · equipment",
    distance: "steps",
    canvas:
      "Map. Move with WASD, scroll to zoom, and press E to enter the nearest location.",
    globeNote: "The same world, seen from above",
    listHint: "Select a place to highlight it.",
    fishNames: {
      carp: "Carp",
      perch: "Perch",
      pike: "Pike",
      salmon: "Salmon",
      trout: "Trout",
    },
  },
};

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const mix = (a, b, amount) => a + (b - a) * amount;
export const smooth = (value) => {
  const v = clamp(value, 0, 1);
  return v * v * (3 - 2 * v);
};
export const distanceTo = (player, location) =>
  Math.hypot(player.x - location.entry.x, player.y - location.entry.y);
export const nearestLocation = (player) =>
  LOCATIONS.reduce(
    (nearest, location) =>
      !nearest || distanceTo(player, location) < distanceTo(player, nearest)
        ? location
        : nearest,
    null,
  );

export function followCamera(camera, player, zoom) {
  const halfWidth = VIEW.width / (2 * zoom);
  const halfHeight = VIEW.height / (2 * zoom);
  const edgeX = halfWidth * 0.48;
  const edgeY = halfHeight * 0.42;
  return {
    x:
      clamp(player.x, camera.x - edgeX, camera.x + edgeX) === player.x
        ? camera.x
        : player.x - Math.sign(player.x - camera.x) * edgeX,
    y:
      clamp(player.y, camera.y - edgeY, camera.y + edgeY) === player.y
        ? camera.y
        : player.y - Math.sign(player.y - camera.y) * edgeY,
  };
}

export function globePoint(point, longitude, latitude, radius, center) {
  const lon = (point.x / WORLD.width) * Math.PI * 2 - Math.PI - longitude;
  const lat = Math.PI / 2 - (point.y / WORLD.height) * Math.PI;
  const x = Math.cos(lat) * Math.sin(lon);
  const y =
    Math.sin(lat) * Math.cos(latitude) -
    Math.cos(lat) * Math.cos(lon) * Math.sin(latitude);
  const z =
    Math.sin(lat) * Math.sin(latitude) +
    Math.cos(lat) * Math.cos(lon) * Math.cos(latitude);
  return {
    x: center.x + x * radius,
    y: center.y - y * radius,
    visible: z > 0.06,
  };
}
