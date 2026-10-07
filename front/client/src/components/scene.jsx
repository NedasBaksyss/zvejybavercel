const BASE_W = 480;
const BASE_H = 270;
const HORIZON = 148;
const SUN_X = 322;

const P = {
  night: [26, 24, 58],
  deep: [46, 33, 87],
  mauve: [91, 58, 107],
  rose: [164, 80, 107],
  ember: [224, 118, 90],
  gold: [242, 180, 92],
  pale: [255, 220, 168],
};
const SKY = [
  [0, P.night],
  [0.34, P.deep],
  [0.56, P.mauve],
  [0.74, P.rose],
  [0.88, P.ember],
  [0.97, P.gold],
  [1, P.pale],
];
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function createScene({ canvas, stage, getQuality, isAlive }) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  const mix = (a, b, f) => [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
  function skyAt(v) {
    for (let i = 0; i < SKY.length - 1; i++) {
      const [p0, c0] = SKY[i],
        [p1, c1] = SKY[i + 1];
      if (v <= p1) return { lo: c0, hi: c1, f: (v - p0) / (p1 - p0) };
    }
    return { lo: P.pale, hi: P.pale, f: 0 };
  }
  let seed = 1337;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function bake(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    draw(x);
    return c;
  }
  function flip(src) {
    return bake(src.width, src.height, (x) => {
      x.save();
      x.translate(0, src.height);
      x.scale(1, -1);
      x.drawImage(src, 0, 0);
      x.restore();
    });
  }

  let skyLayer;
  function bakeSky() {
    const q = getQuality();
    seed = 1337;
    skyLayer = bake(BASE_W + 20, HORIZON + 4, (x) => {
      for (let y = 0; y < HORIZON + 4; y++) {
        const { lo, hi, f } = skyAt(Math.min(1, y / HORIZON));
        for (let px = 0; px < BASE_W + 20; px++) {
          x.fillStyle = rgb(f > BAYER[y & 3][px & 3] / 16 ? hi : lo);
          x.fillRect(px, y, 1, 1);
        }
      }
      for (let i = 0; i < q.stars; i++) {
        const sx = Math.floor(rnd() * (BASE_W + 20)),
          sy = Math.floor(rnd() * 80);
        if (rnd() > 1 - sy / 88) continue;
        x.fillStyle = rnd() > 0.7 ? "#ffdca8" : "#fff4d8";
        x.fillRect(sx, sy, 1, 1);
      }
      const cy = HORIZON - 6,
        r = 17;
      if (q.sunGlow) {
        for (let gy = cy - 46; gy < cy + 46; gy++) {
          for (let gx = SUN_X - 46 + 10; gx < SUN_X + 46 + 10; gx++) {
            if (gx < 0 || gx >= BASE_W + 20 || gy < 0 || gy >= HORIZON + 4)
              continue;
            const d = Math.hypot(gx - SUN_X - 10, gy - cy);
            if (d < r || d > 46) continue;
            const s = 1 - (d - r) / (46 - r);
            if (s * s * 0.8 > BAYER[gy & 3][gx & 3] / 16) {
              x.fillStyle = rgb(mix(P.ember, P.gold, s));
              x.fillRect(gx, gy, 1, 1);
            }
          }
        }
      }
      for (let dy = -r; dy <= r; dy++) {
        const w = Math.floor(Math.sqrt(r * r - dy * dy));
        x.fillStyle = rgb(mix(P.pale, P.gold, (dy + r) / (2 * r)));
        x.fillRect(SUN_X - w + 10, cy + dy, w * 2, 1);
      }
    });
  }
  function spruce(x, px, baseY, h, w, col) {
    x.fillStyle = col;
    for (let i = 0; i < h; i++) {
      let wd = Math.max(1, Math.round(w * (i / h)));
      if (i % 5 === 0) wd += 1;
      if (i > h - 4) wd = Math.max(1, wd - 2);
      x.fillRect(px - (wd >> 1), baseY - h + i, wd, 1);
    }
  }
  function treeline(baseY, col, minH, maxH, gap, band) {
    return bake(BASE_W + 40, band, (x) => {
      for (let px = -6; px < BASE_W + 40; px += gap + Math.floor(rnd() * 5)) {
        spruce(
          x,
          px,
          baseY,
          minH + Math.floor(rnd() * (maxH - minH)),
          8 + Math.floor(rnd() * 7),
          col,
        );
      }
      x.fillStyle = col;
      x.fillRect(0, baseY - 1, BASE_W + 40, band - baseY + 1);
    });
  }
  seed = 909;
  const nearTrees = treeline(60, "#141227", 24, 46, 7, 64);
  const treeMirror = flip(nearTrees);
  const DECK_Y = 96;
  const dockLayer = bake(BASE_W + 20, 130, (x) => {
    const INK = "#0b0913",
      INK2 = "#161327";
    x.fillStyle = INK;
    x.fillRect(0, DECK_Y, 206, 6);
    x.fillStyle = INK2;
    for (let px = 4; px < 206; px += 11) x.fillRect(px, DECK_Y, 1, 6);
    for (const px of [26, 92, 158, 194]) {
      x.fillStyle = INK;
      x.fillRect(px, DECK_Y + 6, 4, 34);
      x.fillRect(px - 1, DECK_Y + 4, 6, 3);
    }
    const fx = 152,
      fy = DECK_Y;
    x.fillStyle = INK;
    x.fillRect(fx + 1, fy - 15, 5, 3);
    x.fillRect(fx - 1, fy - 12, 8, 1);
    x.fillRect(fx, fy - 11, 5, 4);
    x.fillRect(fx - 1, fy - 7, 7, 6);
    x.fillRect(fx - 4, fy - 2, 9, 3);
  });
  const dockMirror = flip(dockLayer);
  let vignette;
  function bakeVignette() {
    vignette = bake(BASE_W, BASE_H, (x) => {
      for (let y = 0; y < BASE_H; y++)
        for (let px = 0; px < BASE_W; px++) {
          const d = Math.hypot((px - 240) / 240, (y - 135) / 135);
          const s = Math.max(0, (d - 0.55) / 0.85);
          if (s > BAYER[y & 3][px & 3] / 16) {
            x.fillStyle = "#06050e";
            x.fillRect(px, y, 1, 1);
          }
        }
    });
  }
  function rebake() {
    bakeSky();
    bakeVignette();
  }
  rebake();

  function drawWater(tm) {
    const q = getQuality();
    for (let y = HORIZON; y < BASE_H; y++) {
      const d = (y - HORIZON) / (BASE_H - HORIZON);
      ctx.fillStyle = rgb(mix([46, 60, 102], [12, 15, 32], d));
      ctx.fillRect(0, y, BASE_W, 1);
    }
    for (let y = HORIZON + 1; y < BASE_H; y += q.roadStep + 1) {
      const d = (y - HORIZON) / (BASE_H - HORIZON);
      const n = Math.sin(y * 0.7 + tm * 1.9) * Math.cos(y * 0.31 - tm * 1.1);
      const w = Math.max(
        1,
        Math.round((3 + d * 46) * (0.45 + 0.55 * Math.abs(n))),
      );
      ctx.globalAlpha = Math.max(0, (1 - d) * 0.85);
      ctx.fillStyle = rgb(mix(P.gold, P.ember, d));
      ctx.fillRect(Math.round(SUN_X - w / 2 + n * 5), y, w, 1);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(143,168,200,.30)";
    for (let y = HORIZON + 3; y < BASE_H; y += q.crestStep) {
      const d = (y - HORIZON) / (BASE_H - HORIZON);
      const step = 40 + d * 60,
        drift = (tm * (8 + d * 26)) % step;
      for (let px = -step; px < BASE_W; px += step) {
        ctx.fillRect(
          Math.round(px + drift + Math.sin(y + tm) * 6),
          y,
          Math.round(3 + d * 9),
          1,
        );
      }
    }
  }
  function drawReflection(img, topY, depth, tm, alpha) {
    if (!getQuality().reflect) return;
    for (let y = 0; y < depth; y++) {
      const fade = 1 - y / depth;
      ctx.globalAlpha = alpha * fade * fade;
      const wob = Math.sin(y * 0.5 + tm * 1.6) * (1 + y * 0.1);
      ctx.drawImage(
        img,
        0,
        img.height - depth + y,
        img.width,
        1,
        Math.round(-20 + wob),
        topY + y,
        img.width,
        1,
      );
    }
    ctx.globalAlpha = 1;
  }
  function drawMist(tm) {
    const n = getQuality().mist;
    ctx.fillStyle = "rgba(143,168,200,.10)";
    for (let i = 0; i < n; i++) {
      const y = HORIZON - 16 + i * 7;
      const off = ((tm * (5 + i * 3)) % (BASE_W + 160)) - 80;
      ctx.fillRect(Math.round(-off), y, 150 + i * 40, 3);
      ctx.fillRect(Math.round(BASE_W - off * 0.6), y + 2, 120, 2);
    }
  }
  const bobber = { x: 262, y: 188, ring: 0, next: 3 };
  function drawBobber(tm) {
    const y = bobber.y + Math.round(Math.sin(tm * 1.7) * 1.4);
    if (tm > bobber.next) {
      bobber.ring = 0.001;
      bobber.next = tm + 5 + Math.random() * 6;
    }
    if (bobber.ring > 0) {
      const r = bobber.ring * 26;
      ctx.globalAlpha = Math.max(0, 0.5 - bobber.ring * 0.5);
      ctx.strokeStyle = "#cfe0f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(bobber.x + 0.5, y + 2.5, r, r * 0.34, 0, 0, 7);
      ctx.stroke();
      ctx.globalAlpha = 1;
      bobber.ring += 0.012;
      if (bobber.ring > 1) bobber.ring = 0;
    }
    ctx.fillStyle = "#d4574e";
    ctx.fillRect(bobber.x, y, 3, 3);
    ctx.fillStyle = "#ffdca8";
    ctx.fillRect(bobber.x, y - 2, 3, 2);
    return y;
  }
  function drawRod(dockX, dockY, bobY) {
    const hx = dockX + 158,
      hy = dockY + DECK_Y - 8;
    let rx = hx,
      ry = hy;
    ctx.fillStyle = "#241c30";
    for (let i = 0; i < 44; i++) {
      ctx.fillRect(Math.round(rx), Math.round(ry), 1, 1);
      rx += 1;
      ry -= 0.5 - i * 0.008;
    }
    ctx.strokeStyle = "rgba(207,224,240,.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(rx) + 0.5, Math.round(ry) + 0.5);
    ctx.quadraticCurveTo(
      (rx + bobber.x) / 2,
      ry + 14,
      bobber.x + 1.5,
      bobY + 0.5,
    );
    ctx.stroke();
  }
  const birds = { t: -8, y: 44 };
  function drawBirds(tm) {
    if (!getQuality().birds) return;
    if (tm > birds.t + 26) {
      birds.t = tm;
      birds.y = 28 + Math.random() * 34;
    }
    const age = tm - birds.t;
    if (age < 0 || age > 16) return;
    const bx = -20 + age * 34;
    ctx.fillStyle = "#2a2545";
    for (let i = 0; i < 3; i++) {
      const x = bx - i * 13,
        y = birds.y + i * 5 + Math.sin(tm * 3 + i) * 2;
      const f = Math.sin(tm * 7 + i * 1.3) > 0 ? 1 : 0;
      ctx.fillRect(Math.round(x), Math.round(y), 2, 1);
      ctx.fillRect(Math.round(x - 2), Math.round(y - f), 2, 1);
      ctx.fillRect(Math.round(x + 2), Math.round(y - f), 2, 1);
    }
  }

  const par = { tx: 0, ty: 0, x: 0, y: 0 };
  const onPointerMove = (event) => {
    const rect = stage.getBoundingClientRect();
    par.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    par.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };
  const onPointerLeave = () => {
    par.tx = 0;
    par.ty = 0;
  };
  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerleave", onPointerLeave);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  let frameId = 0;
  function frame(now) {
    if (!isAlive()) return;
    const tm = (now - t0) / 1000,
      motionTime = reduced ? 0 : tm;
    par.x += (par.tx - par.x) * 0.06;
    par.y += (par.ty - par.y) * 0.06;
    const off = (d, a) => Math.round((a === "x" ? par.x : par.y) * d);
    ctx.clearRect(0, 0, BASE_W, BASE_H);
    ctx.drawImage(skyLayer, -10 + off(2, "x"), off(1.5, "y"));
    drawMist(motionTime);
    ctx.drawImage(nearTrees, -20 + off(7, "x"), 86 + off(3, "y"));
    drawWater(motionTime);
    drawReflection(treeMirror, HORIZON, 34, motionTime, 0.62);
    const dockX = -10 + off(11, "x"),
      dockY = 140 + off(5, "y");
    const bobY = drawBobber(motionTime);
    ctx.drawImage(dockLayer, dockX, dockY);
    drawReflection(dockMirror, dockY + DECK_Y + 6, 16, motionTime, 0.4);
    drawRod(dockX, dockY, bobY);
    drawBirds(reduced ? -99 : tm);
    if (getQuality().vignette) ctx.drawImage(vignette, 0, 0);
    frameId = requestAnimationFrame(frame);
  }
  frameId = requestAnimationFrame(frame);

  return {
    rebake,
    stop() {
      cancelAnimationFrame(frameId);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
    },
  };
}
