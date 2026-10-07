export function makeCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function noise(x, y, salt = 0) {
  let value =
    Math.imul(x ^ 1597334677, 2246822519) ^ Math.imul(y ^ salt, 3266489917);
  value = Math.imul(value ^ (value >>> 16), 2246822519);
  return ((value ^ (value >>> 13)) >>> 0) / 4294967296;
}

export const intersects = (bounds, x, y, radius) =>
  x + radius >= bounds.x &&
  x - radius <= bounds.x + bounds.width &&
  y + radius >= bounds.y &&
  y - radius <= bounds.y + bounds.height;
