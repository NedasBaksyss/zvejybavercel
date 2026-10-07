export function createAuthController({
  $,
  root,
  Api,
  UI,
  Sound,
  later,
  isAlive,
  getText,
  getPlayer,
  setPlayer,
  signOut,
  paintMenu,
  applyLanguage,
  emit,
}) {
  let authMode = "login";
  let busy = false;
  const listeners = new AbortController();
  const msgEl = $("auth-msg");
  const goBtn = $("auth-go");
  const outBtn = $("auth-out");

  root.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (busy) return;
      authMode = tab.dataset.mode;
      $("s-auth").classList.toggle("register-mode", authMode === "register");
      root
        .querySelectorAll(".tab")
        .forEach((item) => item.setAttribute("aria-selected", item === tab));
      $("f-mail-wrap").hidden = authMode === "login";
      $("f-pass").setAttribute(
        "autocomplete",
        authMode === "login" ? "current-password" : "new-password",
      );
      msgEl.textContent = "";
      msgEl.className = "msg";
      applyLanguage();
      Sound.move();
    }, { signal: listeners.signal });
  });

  async function submitAuth() {
    if (busy || !isAlive()) return;
    const language = getText();
    const user = $("f-user").value.trim();
    const pass = $("f-pass").value;
    const mail = $("f-mail").value.trim();
    msgEl.className = "msg";
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(user)) {
      msgEl.textContent = language.errUser;
      Sound.deny();
      return;
    }
    if (pass.length < 8 || pass.length > 128) {
      msgEl.textContent = language.errPass;
      Sound.deny();
      return;
    }
    if (authMode === "register" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      msgEl.textContent = language.errMail;
      Sound.deny();
      return;
    }
    busy = true;
    goBtn.disabled = true;
    goBtn.textContent = language.working;
    try {
      const player =
        authMode === "login"
          ? await Api.login(user, pass)
          : await Api.register(user, pass, mail);
          if (!isAlive()) return;
          setPlayer(player);
      $("f-pass").value = "";
      msgEl.className = "msg ok";
      msgEl.textContent =
        authMode === "login"
          ? language.welcome(player.user.username)
          : language.created(player.user.username);
      Sound.confirm();
      emit("login", player);
      paintMenu();
      later(() => UI.go("title"), 800);
    } catch (error) {
      if (!isAlive()) return;
      msgEl.textContent = error.message;
      Sound.deny();
    } finally {
      busy = false;
      if (isAlive()) {
        goBtn.disabled = false;
        applyLanguage();
      }
    }
  }

  goBtn.addEventListener("click", submitAuth, { signal: listeners.signal });
  outBtn.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    outBtn.disabled = true;
    try {
      await signOut();
      if (!isAlive()) return;
      Sound.back();
      msgEl.className = "msg";
      msgEl.textContent = "";
      $("f-pass").value = "";
      paintMenu();
      applyLanguage();
    } catch (error) {
      if (isAlive()) msgEl.textContent = error.message;
    } finally {
      busy = false;
      if (isAlive()) outBtn.disabled = false;
    }
  }, { signal: listeners.signal });
  root.querySelectorAll("#s-auth input").forEach((input) =>
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") submitAuth();
    }, { signal: listeners.signal }),
  );

  UI.register("auth", {
    el: "s-auth",
    back: "title",
    enter() {
      applyLanguage();
      later(() => $("f-user").focus(), 30);
    },
    key() {},
  });

  return {
    stop() { listeners.abort(); },
    showError(message) { msgEl.className = "msg"; msgEl.textContent = message; },
    getMode: () => authMode,
    apply(language) {
      $("auth-title").textContent = language.authTitle;
      $("lbl-user").textContent = language.fUser;
      $("lbl-pass").textContent = language.fPass;
      $("lbl-mail").textContent = language.fMail;
      goBtn.textContent =
        authMode === "login" ? language.btnLogin : language.btnReg;
      outBtn.textContent = language.btnOut;
      outBtn.hidden = !getPlayer();
      $("hint-auth").textContent = language.hintBack;
    },
  };
}
