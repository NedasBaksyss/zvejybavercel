import { T } from "./components/translations";
import { createSound } from "./components/sound";
import { createSettingsStore } from "./components/settingsStore";
import { createAccountApi } from "./accountApi";
import { createScene } from "./components/scene";
import { createSettingsController } from "./components/settingsController";
import { createAuthController } from "./authController";
import { createChoiceList } from "./components/choiceList";
import { createFontGuard } from "./components/fontGuard";
import { createGameHooks } from "./components/gameHooks";
import { createGuestProgress } from "./guestProgress.js";

export function startMenu(root, map) {
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

  const Store = createSettingsStore();
  Store.load();

  const TSC = { sm: 0.85, md: 1, lg: 1.1 };
  const PLAIN_BOOST = 1.08;
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

  const Api = createAccountApi();
  let sessionKnown = false;
  let restoreSession;

  let player = null;

  let slot = null;
  const gameHooks = createGameHooks({
    root,
    ui: UI,
    store: Store,
    getPlayer: () => player,
    getSlot: () => slot,
  });
  const Hooks = gameHooks.hooks;
  function makeProgress() {
    return createGuestProgress({ accountId: player?.id,
      onChange: (value) => map.setProgress(value),
      onSessionExpired() {
        setPlayer(null);
        UI.go("auth");
        auth.showError(t().sessionExpired);
      },
    });
  }
  let progress = makeProgress();
  let signingOut = false;
  function setPlayer(value) {
    if (!alive) return;
    sessionKnown = true;
    progress.stop();
    player = value;
    slot = null;
    map.reset();
    map.setProgress(null);
    progress = makeProgress();
  }
  async function signOut() {
    await Api.logout();
    if (!alive) return;
    setPlayer(null);
    $("f-pass").value = "";
    Hooks.emit("signOut");
  }
  Hooks.on("fishCaught", () => progress.recordCatch());
  Hooks.on("start", () => progress.refresh());
  const refreshProgress = () => { if (current === "game") progress.refresh(); };
  addEventListener("online", refreshProgress);
  addEventListener("focus", refreshProgress);
  const progressTimer = setInterval(refreshProgress, 15000);
  map.configure({
    getLanguage: () => Store.get("lang"),
    getSlot: () => slot,
    emit: (event, data) => Hooks.emit(event, data),
    onPause: () => UI.go("pause"),
    retryProgress: () => progress.refresh(),
  });
  let pendingOwner = null;
  let settingsBack = "title";
  let askMode = "new";

  const MENU = [
    { id: "play", key: "play", hidden: () => !!slot },
    { id: "continue", key: "cont", off: () => !slot },
    { id: "settings", key: "settings" },
    { id: "credits", key: "credits" },
    { id: "signout", key: "btnOut", hidden: () => !player },
    { id: "quit", key: "quit" },
  ];
  const isOff = (m) => signingOut || !!(m.off && m.off());
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
      b.textContent = player.user.username;
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
    if (signingOut) return;
    Sound.confirm();
    if (id === "play") startTrip();
    else if (id === "continue") resumeTrip();
    else if (id === "signout") signOutFromMenu();
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

  async function signOutFromMenu() {
    signingOut = true;
    paintMenu();
    try {
      await signOut();
      if (!alive) return;
      sel = 0;
      UI.go("title");
    } catch (error) {
      if (!alive) return;
      UI.go("auth");
      auth.showError(error.message);
    } finally {
      signingOut = false;
      if (alive) paintMenu();
    }
  }

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

  const pauseList = createChoiceList({
    $,
    sound: Sound,
    elementId: "pause-list",
  });
  const confList = createChoiceList({
    $,
    sound: Sound,
    elementId: "conf-list",
  });

  async function startTrip() {
    await restoreSession;
    if (!alive) return;
    if (!sessionKnown) { UI.go("auth"); auth.showError(t().sessionError); return; }
    if (player) loadTrip(player.user.username);
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
    if (!alive) return;
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
      } else askConfirm();
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
  function paintGame() {
    map.applyLanguage();
  }
  UI.register("game", {
    el: "s-game",
    back: "pause",
    enter() {
      paintGame();
      map.enter();
      root.classList.add("atlas-active");
      Hooks.emit("start", { slot, player, settings: Store.all() });
    },
    exit() {
      map.exit();
      root.classList.remove("atlas-active");
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
          run: async () => {
            try {
              await signOut();
              if (!alive) return;
              sel = 0;
              paintMenu();
              UI.go("title");
            } catch (error) {
              if (alive) $("conf-body").textContent = error.message;
            }
          },
        },
      ]);
    },
    key: (e) => confList.key(e),
  });

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

  const auth = createAuthController({
    $,
    root,
    Api,
    UI,
    Sound,
    later,
    isAlive: () => alive,
    getText: t,
    getPlayer: () => player,
    setPlayer,
    signOut,
    paintMenu,
    applyLanguage: applyLang,
    emit: (event, data) => Hooks.emit(event, data),
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
        map.reset();
        Hooks.emit("newTrip", { slot, settings: Store.all() });
        sel = 0;
        later(() => {
          paintMenu();
          UI.go("game");
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

  function applyLang() {
    const L = t();
    document.documentElement.lang = Store.get("lang").toLowerCase();
    root.querySelector('.tab[data-mode="login"]').textContent = L.tabLogin;
    root.querySelector('.tab[data-mode="register"]').textContent = L.tabReg;
    auth.apply(L);
    $("hint-cred").textContent = L.hintBack;
    $("cred-title").textContent = L.credTitle;
    $("cred-body").innerText = L.credBody;
    $("set-title").textContent = L.setTitle;
    $("hint-set").textContent = L.hintSet;
    $("bye-title").textContent = L.byeTitle;
    $("bye-body").innerText = L.byeBody;
    $("hint-ask").textContent = L.hintBack;
    $("hint-pause").textContent = L.hintBack;
    paintMenu();
    const n = UI.now();
    if (n === "settings") settings.paint();
    if (n === "game") paintGame();
    if (n === "ask" || n === "pause" || n === "confirm") Screens[n].enter();
  }

  function onKey(e) {
    const s = Screens[UI.now()];
    if (e.key === "Escape") {
      if (UI.now() === "game" && map.back()) {
        e.preventDefault();
        Sound.back();
        return;
      }
      if (!s || s.back === undefined) return;
      Sound.back();
      UI.go(typeof s.back === "function" ? s.back() : s.back);
      return;
    }
    if (UI.now() === "game") return;
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

  Hooks.on("start", (d) => console.log("[menu] start →", d));

  const fontGuard = createFontGuard({
    root,
    isAlive: () => alive,
    applyTextSize,
  });
  fontGuard.start();

  applyFont();
  applyTextSize();
  fit();
  applyLang();
  UI.go("title");
  restoreSession = Api.current().then((value) => {
    if (!alive) return;
    setPlayer(value);
    paintMenu();
    applyLang();
  }).catch(() => { sessionKnown = false; });

  return () => {
    alive = false;
    progress.stop();
    clearInterval(progressTimer);
    auth.stop();
    removeEventListener("online", refreshProgress);
    removeEventListener("focus", refreshProgress);
    map.stop();
    root.classList.remove("atlas-active");
    scene.stop();
    timers.forEach(clearTimeout);
    timers.clear();
    removeEventListener("resize", fit);
    removeEventListener("keydown", onKey);
    fontGuard.stop();
    Sound.close();
    gameHooks.stop();
  };
}
