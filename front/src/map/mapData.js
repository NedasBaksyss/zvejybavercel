export const WORLD_SCALE = 4;
export const WORLD = { width: 6400, height: 3200 };
export const WORLD_TEXTURE = { width: 1600, height: 800 };
export const MAP_VERSION = 3;
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
    x: 3420,
    y: 1060,
    radiusX: 115,
    radiusY: 80,
    rotation: -0.55,
    waterColor: "#397f80",
    entry: { x: 3500, y: 1145 },
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
    x: 3550,
    y: 1430,
    entry: { x: 3550, y: 1452 },
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
  {
    id: "pine-lake",
    type: "lake",
    x: 4280,
    y: 1465,
    radiusX: 95,
    radiusY: 155,
    rotation: -0.45,
    waterColor: "#286773",
    entry: { x: 4150, y: 1395 },
    name: { LT: "Pušų ežeras", EN: "Pine Lake" },
    description: {
      LT: "Ramus ežeras tarp pušyno ir smėlėto kranto.",
      EN: "Still water between pine woods and a sandy shore.",
    },
    possibleFish: ["carp", "perch"],
  },
  {
    id: "riverside-shop",
    type: "shop",
    x: 4380,
    y: 1190,
    entry: { x: 4380, y: 1212 },
    name: { LT: "Pakrantės masalai", EN: "Riverside Bait" },
    description: {
      LT: "Maža masalų parduotuvė prie upės tako.",
      EN: "A little bait shop beside the riverside trail.",
    },
    possibleFish: [],
  },
  {
    id: "reed-lake",
    type: "lake",
    x: 3310,
    y: 1450,
    radiusX: 100,
    radiusY: 135,
    rotation: 0.25,
    waterColor: "#477e68",
    entry: { x: 3425, y: 1470 },
    name: { LT: "Nendrių ežeras", EN: "Reed Lake" },
    description: {
      LT: "Platūs vakariniai krantai ir ilgi takai tarp nendrių.",
      EN: "Wide western banks and long trails through the reeds.",
    },
    possibleFish: ["carp", "pike"],
  },
  {
    id: "meadow-lake",
    type: "lake",
    x: 4690,
    y: 1210,
    radiusX: 180,
    radiusY: 95,
    rotation: 0.25,
    waterColor: "#348a91",
    entry: { x: 4520, y: 1280 },
    name: { LT: "Pievų ežeras", EN: "Meadow Lake" },
    description: {
      LT: "Atvira pieva prie didelio ežero rytinėje pakrantėje.",
      EN: "An open meadow beside a broad lake on the eastern coast.",
    },
    possibleFish: ["perch", "carp"],
  },
  {
    id: "highland-lake",
    type: "lake",
    x: 4520,
    y: 865,
    radiusX: 135,
    radiusY: 68,
    rotation: -0.12,
    waterColor: "#427f9b",
    entry: { x: 4490, y: 951 },
    name: { LT: "Šalnų ežeras", EN: "Frostwater Lake" },
    description: {
      LT: "Ledinis ežeras tarp apsnigtų viršūnių ir šerkšnotų pušų.",
      EN: "An icy lake beneath snow-covered peaks and frost-laden pines.",
    },
    possibleFish: ["trout", "perch"],
  },
  {
    id: "sunset-lake",
    type: "lake",
    x: 3510,
    y: 1820,
    radiusX: 125,
    radiusY: 75,
    rotation: -0.2,
    waterColor: "#427d83",
    entry: { x: 3500, y: 1910 },
    name: { LT: "Saulėlydžio ežeras", EN: "Sunset Lake" },
    description: {
      LT: "Pietinis ežeras su plačia smėlėta pakrante.",
      EN: "A southern lake with a wide, sandy shoreline.",
    },
    possibleFish: ["carp", "pike", "perch"],
  },
  {
    id: "southern-shop",
    type: "shop",
    x: 3410,
    y: 1960,
    entry: { x: 3410, y: 1982 },
    name: { LT: "Pietų krautuvė", EN: "Southern Supply" },
    description: {
      LT: "Kelionės reikmenys ir erdvi aikštelė pietiniame take.",
      EN: "Travel supplies and a spacious clearing on the southern trail.",
    },
    possibleFish: [],
  },
  {
    id: "eastern-shop",
    type: "shop",
    x: 4880,
    y: 1030,
    entry: { x: 4880, y: 1052 },
    name: { LT: "Rytų masalai", EN: "Eastern Bait" },
    description: {
      LT: "Masalų krautuvė tolimajame rytiniame žemėlapio krašte.",
      EN: "A bait shop at the far end of the eastern trails.",
    },
    possibleFish: [],
  },
];

export const CLEARINGS = [
  { ...SPAWN, radius: 72 },
  { x: 3550, y: 1510, radius: 65 },
  { x: 4320, y: 1120, radius: 75 },
  { x: 3440, y: 2040, radius: 60 },
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
    cast: "Mesti meškerę",
    reel: "Susukti valą",
    lineReady: "Meškerė paruošta",
    lineInWater: "Masalas vandenyje",
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
    cast: "Cast the line",
    reel: "Reel in",
    lineReady: "Rod ready",
    lineInWater: "Line in the water",
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

export function followCamera(camera, player, dt, reducedMotion = false) {
  // Follow immediately, with the same easing speed at every frame rate.
  const amount = reducedMotion ? 1 : 1 - Math.exp(-dt * 12);
  return {
    x: mix(camera.x, player.x, amount),
    y: mix(camera.y, player.y, amount),
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
