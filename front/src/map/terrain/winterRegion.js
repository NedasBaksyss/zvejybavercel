// Shared snow line for ground, trees, banks and paths, in world coordinates.
export function snowLine(x) {
  const distance = (x - 4330) / 760;
  if (Math.abs(distance) >= 1) return 0;
  return 610 + 430 * Math.sqrt(1 - distance * distance) +
    Math.sin(x * 0.021) * 12 + Math.sin(x * 0.057) * 5;
}

export const isWinter = (x, y) => y < snowLine(x);

// Two ridges separated by the river valley. Full silhouettes and their
// foothill shadows have breathing room, including at the northern coast.
export const WINTER_PEAKS = [
  [3855, 742, 78, 70],
  [4000, 748, 76, 82],
  [4290, 777, 94, 86],
  [4445, 720, 78, 65],
  [4600, 696, 98, 102],
  [4750, 758, 82, 74],
];

export function mountainBounds([x, y, width, height], padding = 0) {
  return {
    left: x - width * 0.65 - padding,
    right: x + width * 0.8 + padding,
    top: y - height - padding,
    bottom: y + height * 0.22 + padding,
  };
}

export function winterPath(scale = 1) {
  const path = new Path2D();
  path.moveTo(3570 / scale, 0);
  for (let x = 3570; x <= 5090; x += 8)
    path.lineTo(x / scale, snowLine(x) / scale);
  path.lineTo(5090 / scale, 0);
  path.closePath();
  return path;
}

export function drawWinterMountain(ctx, x, y, width, height) {
  const shape = (points, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([u, v], i) => ctx[i ? "lineTo" : "moveTo"](
      Math.round((x + u * width) / 2) * 2, Math.round((y + v * height) / 2) * 2));
    ctx.closePath();
    ctx.fill();
  };
  shape([[-0.65, 0.08], [-0.3, -0.2], [0.42, -0.1], [0.8, 0.1], [0.1, 0.22]], "#b8cbd0");
  shape([[-0.6, 0], [-0.39, -0.38], [-0.25, -0.46], [-0.08, -1], [0.12, -0.76], [0.28, -0.39], [0.39, -0.33], [0.6, 0.05]], "#718a9a");
  shape([[-0.6, 0], [-0.39, -0.38], [-0.25, -0.46], [-0.08, -1], [-0.04, -0.59], [-0.18, -0.29], [-0.13, 0.04]], "#b7cbd3");
  shape([[-0.08, -1], [0.12, -0.76], [0.28, -0.39], [0.13, -0.52], [0.08, -0.4], [-0.04, -0.59], [-0.16, -0.46], [-0.25, -0.46]], "#edf4ef");
  shape([[-0.08, -0.96], [0.12, -0.76], [0.18, -0.58], [0.06, -0.67], [0.01, -0.55]], "#cddfe5");
  shape([[-0.38, -0.35], [-0.22, -0.42], [-0.29, -0.13], [-0.48, 0.01]], "#dce8e7");
  shape([[0.13, -0.4], [0.24, -0.24], [0.35, -0.03], [0.19, -0.08]], "#9cb4c2");
}
