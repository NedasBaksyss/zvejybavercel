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
  paintMenu,
  applyLanguage,
  emit,
}) {
  let authMode = "login";
  const msgEl = $("auth-msg");
  const goBtn = $("auth-go");
  const outBtn = $("auth-out");

  root.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
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
    });
  });

  async function submitAuth() {
    const language = getText();
    const user = $("f-user").value.trim();
    const pass = $("f-pass").value;
    const mail = $("f-mail").value.trim();
    msgEl.className = "msg";
    if (user.length < 3) {
      msgEl.textContent = language.errUser;
      Sound.deny();
      return;
    }
    if (pass.length < 6) {
      msgEl.textContent = language.errPass;
      Sound.deny();
      return;
    }
    if (authMode === "register" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      msgEl.textContent = language.errMail;
      Sound.deny();
      return;
    }
    goBtn.disabled = true;
    goBtn.textContent = language.working;
    try {
      const player =
        authMode === "login"
          ? await Api.login(user, pass)
          : await Api.register(user, pass, mail);
      setPlayer(player);
      if (!isAlive()) return;
      msgEl.className = "msg ok";
      msgEl.textContent =
        authMode === "login"
          ? language.welcome(player.user)
          : language.created(player.user);
      Sound.confirm();
      emit("login", player);
      paintMenu();
      later(() => UI.go("title"), 800);
    } catch (error) {
      if (!isAlive()) return;
      msgEl.textContent = error.message;
      Sound.deny();
    } finally {
      if (isAlive()) {
        goBtn.disabled = false;
        applyLanguage();
      }
    }
  }

  goBtn.addEventListener("click", submitAuth);
  outBtn.addEventListener("click", () => {
    setPlayer(null);
    Sound.back();
    msgEl.className = "msg";
    msgEl.textContent = "";
    $("f-pass").value = "";
    paintMenu();
    applyLanguage();
  });
  root.querySelectorAll("#s-auth input").forEach((input) =>
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") submitAuth();
    }),
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
