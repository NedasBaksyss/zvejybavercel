import { useEffect, useRef } from "react";
import { T } from "./translations";
import MenuView from "./MenuView";
import { createSound } from "./sound";
import { createSettingsStore } from "./settingsStore";
import { createAccountApi } from "./accountApi";
import { createScene } from "./scene";
import { createSettingsController } from "./settingsController";
import "./App.css";

/* ==========================================================================
   THE COMPONENT
   ========================================================================== */
function App() {
  const rootRef = useRef(null);

  useEffect(() => {
    const stop = startMenu(rootRef.current);
    return stop;
  }, []);

  return <MenuView rootRef={rootRef} />;
}

/* ========================================================================== 
   THE MENU ENGINE
   Same imperative code as the original page, wrapped so it can be started
   and — crucially — stopped again when React unmounts the component.
   Returns a cleanup function.
   ========================================================================== */
function startMenu(root) {
  let alive = true;
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
  const Store = createSettingsStore();
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
    const w = window.innerWidth;
    const h = window.innerHeight;
    const stretch = Store.get("scaling") === "stretch";

    let scale = Math.min(w / BASE_W, h / BASE_H);

    if (!stretch) {
      scale = Math.max(1, Math.floor(scale));
    }

    stage.classList.toggle("stretch", stretch);
    root.style.setProperty("--scale", scale);
  }
  addEventListener("resize", fit);

  /* ---- 4. SOUND ---------------------------------------------------------- */
  const Sound = createSound({
    isAlive: () => alive,
    getVolume: () => Store.get("sfx") / 12,
    later,
  });

  const scene = createScene({
    canvas: $("scene"),
    stage,
    getQuality: Q,
    isAlive: () => alive,
  });

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

  /* ---- 7. ACCOUNTS — a working stub. Swap the factory for fetch() when Node is up. */
  const Api = createAccountApi({ later, getText: t });

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
        if (b.disabled) {
          Sound.deny();
        } else {
          sel = i;
          choose(m.id);
        }
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
  const settings = createSettingsController({
    $,
    getText: t,
    Store,
    Sound,
    UI,
    getSettingsBack: () => settingsBack,
    fit,
    applyFont,
    applyTextSize,
    scene,
    onLanguageChange: applyLang,
  });

  /* ---- 10. AUTH ---------------------------------------------------------- */
  const msgEl = $("auth-msg");
  const goBtn = $("auth-go");
  const outBtn = $("auth-out");

  root.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      authMode = tab.dataset.mode;
      $("s-auth").classList.toggle("register-mode", authMode === "register");
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
    if (n === "settings") settings.paint();
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
    } catch {
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
    scene.stop();
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
