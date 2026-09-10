import { useState, useEffect, useRef } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";

/* ==========================================================================
   THE COMPONENT
   ========================================================================== */
function App() {
  const [count, setCount] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const stop = startMenu(rootRef.current);
    return stop;
  }, []);

  return (
    <div className="zv" ref={rootRef}>
      <div id="stage">
        <canvas id="scene" width="480" height="270" />

        <div id="ui">
          <section className="screen active" id="s-title">
            <div id="logo">
              <div className="word" id="logo-word" />
              <div className="sub" id="logo-sub" />
            </div>
            <nav id="menu" />
            <p id="who" hidden />
          </section>

          <section className="screen" id="s-auth">
            <div className="panel">
              <h2 id="auth-title" />
              <div className="tabs">
                <button
                  className="tab"
                  type="button"
                  data-mode="login"
                  aria-selected="true"
                />
                <button
                  className="tab"
                  type="button"
                  data-mode="register"
                  aria-selected="false"
                />
              </div>
              <div className="field">
                <span id="lbl-user" />
                <input id="f-user" autoComplete="username" maxLength={20} />
              </div>
              <div className="field">
                <span id="lbl-pass" />
                <input
                  id="f-pass"
                  type="password"
                  autoComplete="current-password"
                  maxLength={40}
                />
              </div>
              <div className="field" id="f-mail-wrap" hidden>
                <span id="lbl-mail" />
                <input
                  id="f-mail"
                  type="email"
                  autoComplete="email"
                  maxLength={60}
                />
              </div>
              <p className="msg" id="auth-msg" />
              <button className="btn" type="button" id="auth-go" />
              <button
                className="btn ghost"
                type="button"
                id="auth-out"
                hidden
              />
            </div>
            <p className="hint" id="hint-auth" />
          </section>

          <section className="screen" id="s-settings">
            <div className="panel">
              <h2 id="set-title" />
              <div id="opts" />
            </div>
            <p className="hint" id="hint-set" />
          </section>

          <section className="screen" id="s-credits">
            <div className="panel credits">
              <h2 id="cred-title" />
              <p id="cred-body" />
            </div>
            <p className="hint" id="hint-cred" />
          </section>

          <section className="screen" id="s-ask">
            <svg className="rod" viewBox="0 0 480 270" aria-hidden="true">
              <g transform="translate(46 258) rotate(-34.3)">
                <rect
                  className="grip"
                  x="-74"
                  y="-7"
                  width="62"
                  height="14"
                  rx="3"
                />
                <rect
                  className="seat"
                  x="-12"
                  y="-5"
                  width="24"
                  height="10"
                  rx="2"
                />
                <circle className="reel" cx="0" cy="14" r="12" />
                <circle className="hub" cx="0" cy="14" r="4" />
                <polygon className="blank" points="0,-5 418,-1 418,1 0,5" />
                <circle className="guide" cx="120" cy="8" r="5" />
                <circle className="guide" cx="205" cy="7" r="4.4" />
                <circle className="guide" cx="278" cy="6" r="3.8" />
                <circle className="guide" cx="340" cy="5.4" r="3.2" />
                <circle className="guide" cx="392" cy="5" r="2.6" />
              </g>
              <path className="line" d="M391 22 Q 472 96 446 264" />
            </svg>
            <div className="panel wide">
              <div className="phead">
                <h2 id="ask-title" />
                <button className="x" id="ask-x" type="button">
                  ✕
                </button>
              </div>
              <div className="cards">
                <button
                  className="card"
                  id="card-guest"
                  type="button"
                  aria-selected="true"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect
                      x="11"
                      y="1"
                      width="2"
                      height="5"
                      fill="var(--pale)"
                    />
                    <path d="M5 13a7 7 0 0 1 14 0z" fill="var(--pale)" />
                    <path d="M19 13a7 7 0 0 1-14 0z" fill="var(--ember)" />
                  </svg>
                  <span className="cap" />
                  <span className="cdesc" />
                </button>
                <button
                  className="card"
                  id="card-account"
                  type="button"
                  aria-selected="false"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect
                      x="2"
                      y="5"
                      width="20"
                      height="14"
                      rx="2"
                      fill="none"
                      stroke="var(--pale)"
                      strokeWidth="2"
                    />
                    <rect x="5" y="9" width="6" height="6" fill="var(--gold)" />
                    <rect
                      x="13"
                      y="9"
                      width="6"
                      height="2"
                      fill="var(--mist)"
                    />
                    <rect
                      x="13"
                      y="13"
                      width="6"
                      height="2"
                      fill="var(--mist)"
                    />
                  </svg>
                  <span className="cap" />
                  <span className="cdesc" />
                </button>
              </div>
              <div className="pfoot">
                <button className="btn slim" id="ask-go" type="button" />
                <button className="link" id="ask-cancel" type="button" />
              </div>
            </div>
            <p className="hint" id="hint-ask" />
          </section>

          <section className="screen" id="s-game">
            <div className="hud">
              <p className="line" id="game-line" />
              <p className="who" id="game-who" />
            </div>
            <p className="hint" id="hint-game" />
          </section>

          <section className="screen" id="s-pause">
            <div className="panel">
              <h2 id="pause-title" />
              <div className="choices" id="pause-list" />
            </div>
            <p className="hint" id="hint-pause" />
          </section>

          <section className="screen" id="s-confirm">
            <div className="panel">
              <h2 id="conf-title" />
              <p className="note" id="conf-body" />
              <div className="choices" id="conf-list" />
            </div>
          </section>

          <section className="screen" id="loading">
            <div className="box">
              <p className="what" id="load-what" />
              <div className="bar">
                <i id="load-bar" />
              </div>
              <p className="tip" id="load-tip" />
            </div>
          </section>

          <section className="screen" id="s-bye">
            <div className="panel">
              <h2 id="bye-title" />
              <p id="bye-body" />
            </div>
          </section>
        </div>
        <span id="build">v0.3.0</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   STYLES
   Everything that used to hang off <body> now hangs off .zv, so the menu
   cannot fight with Vite's default index.css / App.css.
   ========================================================================== */
const CSS = `

`;

/* ==========================================================================
   1. TEXT — every visible string lives here, in both languages.
   ========================================================================== */
const T = {
  LT: {
    title: "ŽUVIS IR JAUKAS",
    sub: "TYLUS EŽERAS",
    play: "Nauja kelionė",
    cont: "Tęsti",
    account: "Žvejo kortelė",
    settings: "Nustatymai",
    credits: "Apie",
    quit: "Išeiti",
    signedIn: "Prisijungęs:",
    music: "Muzika",
    sfx: "Garsai",
    quality: "Kokybė",
    scaling: "Vaizdo mastelis",
    lang: "Kalba",
    guest: "Svečias",
    askTitle: "Nauja kelionė",
    askLogin: "Prisijungti",
    askCancel: "Atšaukti",
    guestDesc: "Žvejok iš karto. Kelionė dings uždarius langą.",
    acctDesc: "Prisijunk, ir kelionė liks tavo kortelėje.",
    startBtn: "Pradėti kelionę",

    gameLine: "Čia bus ežeras.",
    gameWho: (o) => `Žvejys: ${o}`,
    hintGame: "Esc – pauzė",
    pauseTitle: "Pauzė",
    resume: "Grįžti į žvejybą",
    toMenu: "Į titulinį",
    confTitle: "Atsijungti",
    confBody:
      "Būsi atjungtas, o ši kelionė uždaryta. Titulinis meniu vėl siūlys naują kelionę.",
    yes: "Taip, atsijungti",
    no: "Ne, grįžti",
    font: "Šriftas",
    f_pixel: "Pikselinis",
    f_plain: "Paprastas",
    textSize: "Teksto dydis",
    ts_sm: "Mažas",
    ts_md: "Vidutinis",
    ts_lg: "Didelis",
    q_low: "Žema",
    q_med: "Vidutinė",
    q_high: "Aukšta",
    sc_int: "Sveiki kartotiniai",
    sc_str: "Per visą ekraną",
    authTitle: "Žvejo kortelė",
    setTitle: "Nustatymai",
    credTitle: "Apie",
    byeTitle: "Iki",
    tabLogin: "Prisijungti",
    tabReg: "Registruotis",
    fUser: "Slapyvardis",
    fPass: "Slaptažodis",
    fMail: "El. paštas",
    btnLogin: "Prisijungti",
    btnReg: "Sukurti paskyrą",
    btnOut: "Atsijungti",
    working: "Palauk…",
    hintBack: "Esc grįžti",
    hintSet: "↑↓ rinktis · ←→ keisti · Esc grįžti",
    credBody:
      "3JS-3 komandos kursinis darbas.\nŽvejybos simuliatorius trijų matmenų ežere.\n\nVariklis: three.js\nServeris: Node · MongoDB\nGrafika: piešta ranka, 480×270",
    byeBody:
      "Naršyklė neleidžia programai uždaryti kortelės, kurios ji pati neatidarė.\nUždaryk ją ranka: Ctrl+W.\n\nAčiū, kad žvejojai.",
    errUser: "Slapyvardis – bent 3 simboliai",
    errPass: "Slaptažodis – bent 6 simboliai",
    errMail: "Neteisingas el. pašto adresas",
    errTaken: "Toks slapyvardis jau užimtas",
    errNoUser: "Tokio žvejo nėra. Pirma registruokis.",
    errWrong: "Neteisingas slaptažodis",
    welcome: (u) => `Sveikas, ${u}`,
    created: (u) => `Paskyra sukurta. Sveikas, ${u}`,
    steps: [
      "Ruošiamas ežeras",
      "Kraunami modeliai",
      "Leidžiamas vanduo",
      "Paleidžiamos žuvys",
      "Rišamas kabliukas",
    ],
    ready: "Pasiruošęs",
    tips: [
      "Karšiai geriau kimba auštant, sekliose vietose.",
      "Lietus drumsčia vandenį – kvapas svarbesnis už spalvą.",
      "Per stipriai sukant valą, jis trūksta. Leisk žuviai pavargti.",
    ],
  },
  EN: {
    title: "FISH N' BAIT",
    sub: "THE QUIET LAKE",
    play: "New trip",
    cont: "Continue",
    account: "Angler card",
    settings: "Settings",
    credits: "About",
    quit: "Quit",
    signedIn: "Signed in:",
    music: "Music",
    sfx: "Sound",
    quality: "Quality",
    scaling: "Scaling",
    lang: "Language",
    guest: "Guest",
    askTitle: "New trip",
    askLogin: "Sign in",
    askCancel: "Cancel",
    guestDesc: "Fish right away. The trip goes when you close the window.",
    acctDesc: "Sign in and the trip stays on your card.",
    startBtn: "Start the trip",

    gameLine: "The lake goes here.",
    gameWho: (o) => `Angler: ${o}`,
    hintGame: "Esc — pause",
    pauseTitle: "Paused",
    resume: "Back to fishing",
    toMenu: "Main menu",
    confTitle: "Sign out",
    confBody:
      "You will be signed out and this trip closed. The title menu will offer a new trip again.",
    yes: "Yes, sign out",
    no: "No, go back",
    font: "Font",
    f_pixel: "Pixel",
    f_plain: "Plain",
    textSize: "Text size",
    ts_sm: "Small",
    ts_md: "Normal",
    ts_lg: "Large",
    q_low: "Low",
    q_med: "Medium",
    q_high: "High",
    sc_int: "Whole multiples",
    sc_str: "Fill the screen",
    authTitle: "Angler card",
    setTitle: "Settings",
    credTitle: "About",
    byeTitle: "Goodbye",
    tabLogin: "Sign in",
    tabReg: "Register",
    fUser: "Username",
    fPass: "Password",
    fMail: "Email",
    btnLogin: "Sign in",
    btnReg: "Create account",
    btnOut: "Sign out",
    working: "Working…",
    hintBack: "Esc to go back",
    hintSet: "↑↓ choose · ←→ change · Esc back",
    credBody:
      "A coursework project by team 3JS-3.\nA fishing simulator on a lake in three dimensions.\n\nEngine: three.js\nServer: Node · MongoDB\nArt: drawn by hand, 480×270",
    byeBody:
      "A browser will not let a page close a tab it did not open itself.\nClose it by hand: Ctrl+W.\n\nThanks for fishing.",
    errUser: "Username needs at least 3 characters",
    errPass: "Password needs at least 6 characters",
    errMail: "That email address is not valid",
    errTaken: "That username is taken",
    errNoUser: "No angler by that name. Register first.",
    errWrong: "Wrong password",
    welcome: (u) => `Welcome back, ${u}`,
    created: (u) => `Account created. Welcome, ${u}`,
    steps: [
      "Preparing the lake",
      "Loading models",
      "Filling the water",
      "Releasing the fish",
      "Tying the hook",
    ],
    ready: "Ready",
    tips: [
      "Bream bite best at dawn, in the shallows.",
      "Rain clouds the water — scent beats colour.",
      "Reel too hard and the line snaps. Let the fish tire.",
    ],
  },
};

/* ==========================================================================
   THE MENU ENGINE
   Same imperative code as the original page, wrapped so it can be started
   and — crucially — stopped again when React unmounts the component.
   Returns a cleanup function.
   ========================================================================== */
function startMenu(root) {
  /* The webfont has to be requested from <head>. An @import inside the
     component's own <style> is only fetched after that stylesheet is parsed,
     which is late enough that the first paint — and the glyph check below —
     can run before the face exists. That is why the pixel text never showed. */
  const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap";
  if (!document.querySelector("link[data-zv-font]")) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = FONT_HREF;
    l.setAttribute("data-zv-font", "");
    document.head.appendChild(l);
  }

  let alive = true;
  let raf = 0;
  const timers = new Set();
  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.delete(id);
      if (alive) fn();
    }, ms);
    timers.add(id);
    return id;
  };

  const $ = (id) => root.querySelector("#" + id);
  const t = () => T[Store.get("lang")];

  /* ---- 2. SETTINGS STORE -------------------------------------------------
     Values are stored as CODES ("high", "integer"), never as display text. */
  const Store = (() => {
    const defaults = {
      music: 6,
      sfx: 9,
      quality: "high",
      scaling: "integer",
      font: "pixel",
      textSize: "md",
      lang: "EN",
    };
    let mem = { ...defaults };
    const KEY = "zvejyba.settings";
    return {
      all: () => ({ ...mem }),
      get: (k) => mem[k],
      set(k, v) {
        mem[k] = v;
        try {
          localStorage.setItem(KEY, JSON.stringify(mem));
        } catch (e) {
          /* private mode */
        }
      },
      load() {
        try {
          mem = {
            ...defaults,
            ...JSON.parse(localStorage.getItem(KEY) || "{}"),
          };
        } catch (e) {
          mem = { ...defaults };
        }
        return this.all();
      },
    };
  })();
  Store.load();

  /* Text face and text size. Both are UI-only; the canvas never uses them. */
  const TSC = { sm: 0.85, md: 1, lg: 1.1 };
  const PLAIN_BOOST = 1.08; // the fallback face needs this to match by eye
  /* "plain" covers both cases: the player chose it, or the pixel font failed
     to load and the glyph guard fell back to it. Either way the same face is
     on screen, so it gets the same size compensation. */
  const onPlainFace = () =>
    Store.get("font") === "plain" || root.classList.contains("nopix");
  const applyTextSize = () =>
    root.style.setProperty(
      "--tsc",
      TSC[Store.get("textSize")] * (onPlainFace() ? PLAIN_BOOST : 1),
    );
  const applyFont = () => {
    root.classList.toggle("plain", Store.get("font") === "plain");
    applyTextSize();
  };

  const QP = {
    low: {
      stars: 0,
      mist: 0,
      reflect: false,
      birds: false,
      roadStep: 3,
      crestStep: 7,
      vignette: false,
      sunGlow: false,
    },
    med: {
      stars: 45,
      mist: 2,
      reflect: true,
      birds: true,
      roadStep: 2,
      crestStep: 5,
      vignette: true,
      sunGlow: true,
    },
    high: {
      stars: 96,
      mist: 4,
      reflect: true,
      birds: true,
      roadStep: 1,
      crestStep: 4,
      vignette: true,
      sunGlow: true,
    },
  };
  const Q = () => QP[Store.get("quality")];

  /* ---- 3. SCALER --------------------------------------------------------- */
  const BASE_W = 480,
    BASE_H = 270;
  const stage = $("stage");
  function fit() {
    const w = innerWidth - 16,
      h = innerHeight - 16;
    const stretch = Store.get("scaling") === "stretch";
    let s = Math.min(w / BASE_W, h / BASE_H);
    if (!stretch) s = Math.max(1, Math.floor(s));
    stage.classList.toggle("stretch", stretch);
    root.style.setProperty("--scale", s);
  }
  addEventListener("resize", fit);

  /* ---- 4. SOUND ---------------------------------------------------------- */
  const Sound = (() => {
    let actx = null;
    const vol = () => Store.get("sfx") / 12;
    function blip(freq, dur, type = "square") {
      if (!alive || vol() <= 0) return;
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        if (actx.state === "suspended") actx.resume();
        const o = actx.createOscillator(),
          g = actx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.06 * vol(), actx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
        o.connect(g).connect(actx.destination);
        o.start();
        o.stop(actx.currentTime + dur);
      } catch (e) {
        /* autoplay policy */
      }
    }
    return {
      move: () => blip(420, 0.05),
      confirm: () => {
        blip(620, 0.06);
        later(() => blip(880, 0.09), 55);
      },
      back: () => blip(240, 0.08),
      deny: () => blip(130, 0.14, "sawtooth"),
      tick: () => blip(700, 0.03),
      close: () => {
        try {
          actx && actx.close();
        } catch (e) {}
      },
    };
  })();

  /* ---- 5. SCENE ---------------------------------------------------------- */
  const cv = $("scene");
  const ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const HORIZON = 148,
    SUN_X = 322;
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
    const q = Q();
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
      for (let px = -6; px < BASE_W + 40; px += gap + Math.floor(rnd() * 5))
        spruce(
          x,
          px,
          baseY,
          minH + Math.floor(rnd() * (maxH - minH)),
          8 + Math.floor(rnd() * 7),
          col,
        );
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
    x.fillRect(fx + 1, fy - 15, 5, 3); // crown
    x.fillRect(fx - 1, fy - 12, 8, 1); // brim
    x.fillRect(fx, fy - 11, 5, 4); // face
    x.fillRect(fx - 1, fy - 7, 7, 6); // torso
    x.fillRect(fx - 4, fy - 2, 9, 3); // legs over the edge
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
    const q = Q();
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
      for (let px = -step; px < BASE_W; px += step)
        ctx.fillRect(
          Math.round(px + drift + Math.sin(y + tm) * 6),
          y,
          Math.round(3 + d * 9),
          1,
        );
    }
  }

  function drawReflection(img, topY, depth, tm, alpha) {
    if (!Q().reflect) return;
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
    const n = Q().mist;
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
    if (!Q().birds) return;
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
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    par.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    par.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  stage.addEventListener("pointerleave", () => {
    par.tx = 0;
    par.ty = 0;
  });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  function frame(now) {
    if (!alive) return;
    const tm = (now - t0) / 1000,
      m = reduced ? 0 : tm;
    par.x += (par.tx - par.x) * 0.06;
    par.y += (par.ty - par.y) * 0.06;
    const off = (d, a) => Math.round((a === "x" ? par.x : par.y) * d);

    ctx.clearRect(0, 0, BASE_W, BASE_H);
    ctx.drawImage(skyLayer, -10 + off(2, "x"), off(1.5, "y"));
    drawMist(m);
    ctx.drawImage(nearTrees, -20 + off(7, "x"), 86 + off(3, "y"));
    drawWater(m);
    drawReflection(treeMirror, HORIZON, 34, m, 0.62);
    const dockX = -10 + off(11, "x"),
      dockY = 140 + off(5, "y");
    const bobY = drawBobber(m);
    ctx.drawImage(dockLayer, dockX, dockY);
    drawReflection(dockMirror, dockY + DECK_Y + 6, 16, m, 0.4);
    drawRod(dockX, dockY, bobY);
    drawBirds(reduced ? -99 : tm);
    if (Q().vignette) ctx.drawImage(vignette, 0, 0);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  /* ---- 6. SCREENS -------------------------------------------------------- */
  const Screens = {};
  let current = null;
  const UI = {
    register(n, d) {
      Screens[n] = d;
    },
    go(n) {
      if (current && Screens[current].exit) Screens[current].exit();
      root
        .querySelectorAll(".screen")
        .forEach((s) => s.classList.remove("active"));
      $(Screens[n].el).classList.add("active");
      current = n;
      if (Screens[n].enter) Screens[n].enter();
    },
    now: () => current,
  };

  /* ---- 7. ACCOUNTS — a working stub. Swap Db for fetch() when Node is up. */
  const Db = new Map(); // username -> {pass, mail}
  const Api = {
    async register(user, pass, mail) {
      await new Promise((r) => later(r, 420));
      if (Db.has(user.toLowerCase())) throw new Error(t().errTaken);
      Db.set(user.toLowerCase(), { pass, mail });
      return { user, token: "dev-" + Math.random().toString(36).slice(2) };
    },
    async login(user, pass) {
      await new Promise((r) => later(r, 420));
      const rec = Db.get(user.toLowerCase());
      if (!rec) throw new Error(t().errNoUser);
      if (rec.pass !== pass) throw new Error(t().errWrong);
      return { user, token: "dev-" + Math.random().toString(36).slice(2) };
    },
  };

  let player = null;
  let authMode = "login";

  /* One trip slot. In memory only, deliberately: the account store above is an
     in-memory stub too, so a slot that survived a reload would outlive the
     account that owns it. Persist both together when the server lands. */
  let slot = null; // {owner, at} or null
  let pendingOwner = null; // who the trip being loaded belongs to
  let settingsBack = "title"; // Esc out of settings returns here
  let askMode = "new"; // which entry opened the chooser: 'new' or 'continue'
  const tripOwner = () =>
    !slot ? "" : slot.owner === "guest" ? t().guest : slot.owner;

  /* ---- 8. TITLE ---------------------------------------------------------- */
  const MENU = [
    { id: "play", key: "play", hidden: () => !!slot }, // gone once a trip exists
    { id: "continue", key: "cont", off: () => !slot }, // lights up once one does
    { id: "settings", key: "settings" },
    { id: "credits", key: "credits" },
    { id: "quit", key: "quit" },
  ];
  const isOff = (m) => !!(m.off && m.off());
  let vis = MENU.slice();
  let sel = 0;
  const menuEl = $("menu");
  const whoEl = $("who");

  function paintMenu() {
    const L = t();
    vis = MENU.filter((m) => !m.hidden || !m.hidden());
    if (sel >= vis.length) sel = vis.length - 1;
    if (sel < 0) sel = 0;
    if (vis[sel] && isOff(vis[sel])) {
      // never leave the cursor on a dead row
      const k = vis.findIndex((m) => !isOff(m));
      if (k >= 0) sel = k;
    }
    menuEl.innerHTML = "";
    vis.forEach((m, i) => {
      const b = document.createElement("button");
      b.className = "item";
      b.type = "button";
      b.setAttribute("aria-selected", i === sel);
      if (isOff(m)) b.disabled = true;
      const bob = document.createElement("span");
      bob.className = "bob";
      const lab = document.createElement("span");
      lab.textContent = L[m.key];
      b.append(bob, lab);
      b.addEventListener("pointerenter", () => {
        if (!b.disabled && sel !== i) {
          sel = i;
          paintMenu();
          Sound.move();
        }
      });
      b.addEventListener("click", () => {
        b.disabled ? Sound.deny() : ((sel = i), choose(m.id));
      });
      menuEl.appendChild(b);
    });
    $("logo-word").textContent = L.title;
    $("logo-sub").textContent = L.sub;
    whoEl.hidden = !player;
    if (player) {
      whoEl.textContent = L.signedIn + " ";
      const b = document.createElement("b");
      b.textContent = player.user; // no innerHTML: usernames are user input
      whoEl.appendChild(b);
    }
  }
  function moveSel(d) {
    let i = sel,
      guard = 0;
    do {
      i = (i + d + vis.length) % vis.length;
      guard++;
    } while (isOff(vis[i]) && guard < 20);
    if (i !== sel) {
      sel = i;
      paintMenu();
      Sound.move();
    }
  }
  function choose(id) {
    Sound.confirm();
    if (id === "play") startTrip();
    else if (id === "continue") resumeTrip();
    else if (id === "settings") {
      settingsBack = "title";
      UI.go("settings");
    } else if (id === "credits") UI.go("credits");
    else if (id === "quit") quit();
  }
  UI.register("title", {
    el: "s-title",
    enter: paintMenu,
    key(e) {
      if (e.key === "ArrowUp" || e.key === "w") moveSel(-1);
      if (e.key === "ArrowDown" || e.key === "s") moveSel(1);
      if (e.key === "Enter" || e.key === " ") choose(vis[sel].id);
    },
  });

  /* window.close() only works on tabs the script opened. Try, then tell the truth. */
  function quit() {
    Hooks.emit("quit");
    window.close();
    later(() => {
      if (!document.hidden) UI.go("bye");
    }, 160);
  }
  UI.register("bye", {
    el: "s-bye",
    back: "title",
    enter() {
      $("bye-title").textContent = t().byeTitle;
      $("bye-body").innerText = t().byeBody;
    },
    key() {},
  });

  /* ========================================================================
     8b. THE TRIP: asking, the game page, pausing, deleting
     ======================================================================== */

  /* One small keyboard list, shared by the three panels below. */
  function ChoiceList(elId) {
    let items = [],
      i = 0;
    return {
      set(list) {
        items = list;
        i = 0;
        this.paint();
      },
      paint() {
        const box = $(elId);
        box.innerHTML = "";
        items.forEach((it, n) => {
          const b = document.createElement("button");
          b.className = "item";
          b.type = "button";
          b.setAttribute("aria-selected", n === i);
          const bob = document.createElement("span");
          bob.className = "bob";
          const lab = document.createElement("span");
          lab.textContent = it.text;
          b.append(bob, lab);
          b.addEventListener("pointerenter", () => {
            if (i !== n) {
              i = n;
              this.paint();
              Sound.move();
            }
          });
          b.addEventListener("click", () => {
            i = n;
            Sound.confirm();
            it.run();
          });
          box.appendChild(b);
        });
      },
      key(e) {
        if (!items.length) return;
        if (e.key === "ArrowUp" || e.key === "w") {
          i = (i - 1 + items.length) % items.length;
          this.paint();
          Sound.move();
        }
        if (e.key === "ArrowDown" || e.key === "s") {
          i = (i + 1) % items.length;
          this.paint();
          Sound.move();
        }
        if (e.key === "Enter" || e.key === " ") {
          Sound.confirm();
          items[i].run();
        }
      },
    };
  }
  const pauseList = ChoiceList("pause-list");
  const confList = ChoiceList("conf-list");

  /* Both entries land here when nobody is signed in: you pick an account or
     carry on as a guest. Signed in, there is nothing to ask, so we skip it. */
  function startTrip() {
    if (player) loadTrip(player.user);
    else {
      askMode = "new";
      UI.go("ask");
    }
  }
  function resumeTrip() {
    if (player) UI.go("game");
    else {
      askMode = "continue";
      UI.go("ask");
    }
  }
  function loadTrip(owner) {
    pendingOwner = owner;
    startLoading();
  }

  /* The chooser. Two cards, arrows or a click to pick, the footer button to
     commit. The card shells live in the markup so the icons stay real SVG
     instead of a string of innerHTML. */
  const ASK_CARDS = [
    {
      id: "guest",
      el: "card-guest",
      cap: (L) => L.guest,
      desc: (L) => L.guestDesc,
    },
    {
      id: "account",
      el: "card-account",
      cap: (L) => L.account,
      desc: (L) => L.acctDesc,
    },
  ];
  let askPick = 0;

  function paintAsk() {
    const L = t(),
      isNew = askMode === "new";
    $("ask-title").textContent = isNew ? L.askTitle : L.cont;
    ASK_CARDS.forEach((c, i) => {
      const el = $(c.el);
      el.setAttribute("aria-selected", i === askPick);
      el.querySelector(".cap").textContent = c.cap(L);
      el.querySelector(".cdesc").textContent = c.desc(L);
    });
    $("ask-go").textContent = isNew ? L.startBtn : L.cont;
    $("ask-cancel").textContent = L.askCancel;
  }
  function askMove(d) {
    askPick = (askPick + d + ASK_CARDS.length) % ASK_CARDS.length;
    paintAsk();
    Sound.move();
  }
  function askConfirm() {
    Sound.confirm();
    if (ASK_CARDS[askPick].id === "account") {
      UI.go("auth");
      return;
    }
    if (askMode === "new") loadTrip("guest");
    else UI.go("game");
  }
  ASK_CARDS.forEach((c, i) => {
    $(c.el).addEventListener("click", () => {
      if (askPick !== i) {
        askPick = i;
        paintAsk();
        Sound.move();
      } else askConfirm(); // click the live card again to commit
    });
  });
  $("ask-go").addEventListener("click", askConfirm);
  $("ask-cancel").addEventListener("click", () => {
    Sound.back();
    UI.go("title");
  });
  $("ask-x").addEventListener("click", () => {
    Sound.back();
    UI.go("title");
  });

  UI.register("ask", {
    el: "s-ask",
    back: "title",
    enter() {
      askPick = 0;
      paintAsk();
    },
    key(e) {
      if (["ArrowLeft", "a", "ArrowUp", "w"].includes(e.key)) askMove(-1);
      if (["ArrowRight", "d", "ArrowDown", "s"].includes(e.key)) askMove(1);
      if (e.key === "Enter" || e.key === " ") askConfirm();
    },
  });
  /* The game page. A placeholder for now — three.js takes the "start" hook. */
  function paintGame() {
    const L = t();
    $("game-line").textContent = L.gameLine;
    $("game-who").textContent = L.gameWho(tripOwner());
  }
  UI.register("game", {
    el: "s-game",
    back: "pause",
    enter() {
      paintGame();
      Hooks.emit("start", { slot, player, settings: Store.all() });
    },
    key() {},
  });

  UI.register("pause", {
    el: "s-pause",
    back: "game",
    enter() {
      const L = t();
      $("pause-title").textContent = L.pauseTitle;
      pauseList.set([
        { text: L.resume, run: () => UI.go("game") },
        {
          text: L.settings,
          run: () => {
            settingsBack = "pause";
            UI.go("settings");
          },
        },
        { text: L.btnOut, run: () => UI.go("confirm") },
        { text: L.toMenu, run: () => UI.go("title") },
      ]);
    },
    key: (e) => pauseList.key(e),
  });

  /* "No" sits first so the safe answer is the one already under the cursor. */
  UI.register("confirm", {
    el: "s-confirm",
    back: "pause",
    enter() {
      const L = t();
      $("conf-title").textContent = L.confTitle;
      $("conf-body").textContent = L.confBody;
      confList.set([
        { text: L.no, run: () => UI.go("pause") },
        {
          text: L.yes,
          run: () => {
            /* Signing out closes the trip with it: the slot belongs to whoever
               was signed in, so leaving it behind would hand it to the next
               person to open the page. */
            player = null;
            slot = null;
            sel = 0;
            Hooks.emit("signOut");
            paintMenu();
            UI.go("title");
          },
        },
      ]);
    },
    key: (e) => confList.key(e),
  });

  /* ---- 9. SETTINGS ------------------------------------------------------- */
  const OPTIONS = [
    { key: "music", label: "music", type: "slider" },
    { key: "sfx", label: "sfx", type: "slider" },
    {
      key: "quality",
      label: "quality",
      type: "cycle",
      values: ["low", "med", "high"],
      text: (v) => t()["q_" + v],
    },
    {
      key: "scaling",
      label: "scaling",
      type: "cycle",
      values: ["integer", "stretch"],
      text: (v) => (v === "integer" ? t().sc_int : t().sc_str),
    },
    {
      key: "font",
      label: "font",
      type: "cycle",
      values: ["pixel", "plain"],
      text: (v) => (v === "pixel" ? t().f_pixel : t().f_plain),
    },
    {
      key: "textSize",
      label: "textSize",
      type: "cycle",
      values: ["sm", "md", "lg"],
      text: (v) => t()["ts_" + v],
    },
    {
      key: "lang",
      label: "lang",
      type: "cycle",
      values: ["EN", "LT"],
      text: (v) => v,
    },
  ];
  let optSel = 0;
  const optsEl = $("opts");

  function paintOpts() {
    const L = t();
    optsEl.innerHTML = "";
    OPTIONS.forEach((o, i) => {
      const row = document.createElement("div");
      row.className = "row" + (i === optSel ? " focused" : "");
      const lab = document.createElement("span");
      lab.className = "label";
      lab.textContent = L[o.label];
      row.appendChild(lab);
      if (o.type === "slider") {
        const s = document.createElement("div");
        s.className = "slider";
        for (let n = 1; n <= 12; n++) {
          const cell = document.createElement("i");
          if (n <= Store.get(o.key)) cell.classList.add("on");
          cell.addEventListener("click", () => {
            Store.set(o.key, n);
            optSel = i;
            paintOpts();
            Sound.tick();
          });
          s.appendChild(cell);
        }
        row.appendChild(s);
      } else {
        const b = document.createElement("button");
        b.className = "cycle";
        b.type = "button";
        const l = document.createElement("span");
        l.className = "arw";
        l.textContent = "◀";
        const v = document.createElement("span");
        v.className = "val";
        v.textContent = o.text(Store.get(o.key));
        const r = document.createElement("span");
        r.className = "arw";
        r.textContent = "▶";
        b.append(l, v, r);
        b.addEventListener("click", () => {
          optSel = i;
          cycle(1);
        });
        row.appendChild(b);
      }
      row.addEventListener("pointerenter", () => {
        if (optSel !== i) {
          optSel = i;
          paintOpts();
        }
      });
      optsEl.appendChild(row);
    });
    $("set-title").textContent = L.setTitle;
    $("hint-set").textContent = L.hintSet;
  }
  function cycle(d) {
    const o = OPTIONS[optSel];
    if (o.type === "slider") {
      Store.set(o.key, Math.max(0, Math.min(12, Store.get(o.key) + d)));
      Sound.tick();
    } else {
      const vs = o.values;
      Store.set(
        o.key,
        vs[(vs.indexOf(Store.get(o.key)) + d + vs.length) % vs.length],
      );
      Sound.move();
      if (o.key === "scaling") fit();
      if (o.key === "font") applyFont();
      if (o.key === "textSize") applyTextSize();
      if (o.key === "quality") rebake();
      if (o.key === "lang") applyLang();
    }
    paintOpts();
  }
  UI.register("settings", {
    el: "s-settings",
    back: () => settingsBack,
    enter: paintOpts,
    key(e) {
      if (e.key === "ArrowUp" || e.key === "w") {
        optSel = (optSel - 1 + OPTIONS.length) % OPTIONS.length;
        paintOpts();
        Sound.move();
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        optSel = (optSel + 1) % OPTIONS.length;
        paintOpts();
        Sound.move();
      }
      if (e.key === "ArrowLeft" || e.key === "a") cycle(-1);
      if (e.key === "ArrowRight" || e.key === "d") cycle(1);
    },
  });

  /* ---- 10. AUTH ---------------------------------------------------------- */
  const msgEl = $("auth-msg");
  const goBtn = $("auth-go");
  const outBtn = $("auth-out");

  root.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      authMode = tab.dataset.mode;
      root
        .querySelectorAll(".tab")
        .forEach((x) => x.setAttribute("aria-selected", x === tab));
      $("f-mail-wrap").hidden = authMode === "login";
      $("f-pass").setAttribute(
        "autocomplete",
        authMode === "login" ? "current-password" : "new-password",
      );
      msgEl.textContent = "";
      msgEl.className = "msg";
      applyLang();
      Sound.move();
    });
  });

  async function submitAuth() {
    const L = t();
    const user = $("f-user").value.trim();
    const pass = $("f-pass").value;
    const mail = $("f-mail").value.trim();
    msgEl.className = "msg";
    if (user.length < 3) {
      msgEl.textContent = L.errUser;
      Sound.deny();
      return;
    }
    if (pass.length < 6) {
      msgEl.textContent = L.errPass;
      Sound.deny();
      return;
    }
    if (authMode === "register" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      msgEl.textContent = L.errMail;
      Sound.deny();
      return;
    }
    goBtn.disabled = true;
    goBtn.textContent = L.working;
    try {
      player =
        authMode === "login"
          ? await Api.login(user, pass)
          : await Api.register(user, pass, mail);
      if (!alive) return;
      msgEl.className = "msg ok";
      msgEl.textContent =
        authMode === "login" ? L.welcome(player.user) : L.created(player.user);
      Sound.confirm();
      Hooks.emit("login", player);
      paintMenu();
      later(() => UI.go("title"), 800);
    } catch (err) {
      if (!alive) return;
      msgEl.textContent = err.message;
      Sound.deny();
    } finally {
      if (alive) {
        goBtn.disabled = false;
        applyLang();
      }
    }
  }
  goBtn.addEventListener("click", submitAuth);
  outBtn.addEventListener("click", () => {
    player = null;
    Sound.back();
    msgEl.className = "msg";
    msgEl.textContent = "";
    $("f-pass").value = "";
    paintMenu();
    applyLang();
  });
  root.querySelectorAll("#s-auth input").forEach((i) =>
    i.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitAuth();
    }),
  );

  UI.register("auth", {
    el: "s-auth",
    back: "title",
    enter() {
      applyLang();
      later(() => $("f-user").focus(), 30);
    },
    key() {},
  });

  UI.register("credits", {
    el: "s-credits",
    back: "title",
    enter() {
      const L = t();
      $("cred-title").textContent = L.credTitle;
      $("cred-body").innerText = L.credBody;
      $("hint-cred").textContent = L.hintBack;
    },
    key() {},
  });

  /* ---- 11. LOADING ------------------------------------------------------- */
  function startLoading() {
    UI.go("loading");
    const L = t();
    const bar = $("load-bar");
    const what = $("load-what");
    const tip = $("load-tip");
    tip.textContent = L.tips[Math.floor(Math.random() * L.tips.length)];
    bar.style.width = "0%";
    let i = 0;
    (function step() {
      if (i >= L.steps.length) {
        bar.style.width = "100%";
        what.textContent = L.ready;
        Sound.confirm();
        slot = { owner: pendingOwner || "guest", at: Date.now() };
        Hooks.emit("newTrip", { slot, settings: Store.all() });
        sel = 0; // "New trip" is gone; land on "Continue"
        later(() => {
          paintMenu();
          UI.go("title");
        }, 760);
        return;
      }
      what.textContent = L.steps[i];
      bar.style.width = Math.round((i / L.steps.length) * 100) + "%";
      i++;
      later(step, 400 + Math.random() * 340);
    })();
  }
  UI.register("loading", { el: "loading", key() {} });

  /* ---- 12. LANGUAGE — repaints every screen ------------------------------ */
  function applyLang() {
    const L = t();
    document.documentElement.lang = Store.get("lang").toLowerCase();
    root.querySelector('.tab[data-mode="login"]').textContent = L.tabLogin;
    root.querySelector('.tab[data-mode="register"]').textContent = L.tabReg;
    $("auth-title").textContent = L.authTitle;
    $("lbl-user").textContent = L.fUser;
    $("lbl-pass").textContent = L.fPass;
    $("lbl-mail").textContent = L.fMail;
    goBtn.textContent = authMode === "login" ? L.btnLogin : L.btnReg;
    outBtn.textContent = L.btnOut;
    outBtn.hidden = !player;
    $("hint-auth").textContent = L.hintBack;
    $("hint-cred").textContent = L.hintBack;
    $("cred-title").textContent = L.credTitle;
    $("cred-body").innerText = L.credBody;
    $("set-title").textContent = L.setTitle;
    $("hint-set").textContent = L.hintSet;
    $("bye-title").textContent = L.byeTitle;
    $("bye-body").innerText = L.byeBody;
    $("hint-ask").textContent = L.hintBack;
    $("hint-pause").textContent = L.hintBack;
    $("hint-game").textContent = L.hintGame;
    paintMenu();
    const n = UI.now();
    if (n === "settings") paintOpts();
    if (n === "game") paintGame();
    if (n === "ask" || n === "pause" || n === "confirm") Screens[n].enter();
  }

  /* ---- 13. INPUT --------------------------------------------------------- */
  function onKey(e) {
    const s = Screens[UI.now()];
    if (e.key === "Escape") {
      if (!s || s.back === undefined) return; // title and loading swallow it
      Sound.back();
      UI.go(typeof s.back === "function" ? s.back() : s.back);
      return;
    }
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(
        e.key,
      ) &&
      document.activeElement.tagName !== "INPUT"
    )
      e.preventDefault();
    if (s && s.key) s.key(e);
  }
  addEventListener("keydown", onKey);

  /* ---- 14. HOOKS — where three.js takes over ----------------------------- */
  const Hooks = (() => {
    const map = {};
    return {
      on(ev, fn) {
        (map[ev] = map[ev] || []).push(fn);
      },
      emit(ev, d) {
        (map[ev] || []).forEach((fn) => fn(d));
      },
    };
  })();
  window.Game = {
    on: Hooks.on,
    show: () => {
      root.style.display = "flex";
      UI.go("title");
    },
    hide: () => {
      root.style.display = "none";
    },
    settings: () => Store.all(),
    player: () => player,
    slot: () => slot,
  };
  Hooks.on("start", (d) => console.log("[menu] start →", d));

  /* ---- 15. BOOT, including the glyph guard for Ž -------------------------
     document.fonts.check() answers "is this face loaded right now", not "can
     it be loaded". A webfont is not fetched until something on the page needs
     it, so checking straight after fonts.ready returns false for a face that
     is perfectly available — and the UI got pinned to the fallback. Ask for
     the face first, then check, then check again once everything settles. */
  /* Every weight is checked, not just one. Asking Google for the discrete list
     400;500;600;700 returns four separate font files; if some arrive and others
     do not, the UI ends up in two different faces at once. The URL now asks for
     the variable range instead, so it is one file, and the guard treats "not all
     weights present" as a failure and falls back wholesale. */
  const PIX = '"Pixelify Sans"';
  const GLYPHS = "\u017D\u0117\u0173";
  const WEIGHTS = [400, 500, 600, 700];
  async function glyphGuard() {
    if (!alive || !document.fonts) return; // no Font Loading API: trust the CSS stack
    try {
      await Promise.all(
        WEIGHTS.map((w) => document.fonts.load(w + " 15px " + PIX, GLYPHS)),
      );
    } catch (e) {
      /* offline, blocked, or no such family */
    }
    if (!alive) return;
    const ok = document.fonts.check
      ? WEIGHTS.every((w) => document.fonts.check(w + " 15px " + PIX, GLYPHS))
      : true;
    root.classList.toggle("nopix", !ok);
    applyTextSize(); // falling back changes the face, so re-size
  }
  glyphGuard();
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(glyphGuard);

  applyFont();
  applyTextSize();
  fit();
  applyLang();
  UI.go("title");

  /* ---- CLEANUP ----------------------------------------------------------- */
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    timers.clear();
    removeEventListener("resize", fit);
    removeEventListener("keydown", onKey);
    removeEventListener("load", glyphGuard);
    Sound.close();
    if (window.Game) delete window.Game;
  };
}

export default App;
