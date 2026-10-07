export function createSettingsController({
  $,
  getText,
  Store,
  Sound,
  UI,
  getSettingsBack,
  fit,
  applyFont,
  applyTextSize,
  scene,
  onLanguageChange,
}) {
  const options = [
    { key: "music", label: "music", type: "slider" },
    { key: "sfx", label: "sfx", type: "slider" },
    {
      key: "quality",
      label: "quality",
      type: "cycle",
      values: ["low", "med", "high"],
      text: (value) => getText()["q_" + value],
    },
    {
      key: "scaling",
      label: "scaling",
      type: "cycle",
      values: ["integer", "stretch"],
      text: (value) =>
        value === "integer" ? getText().sc_int : getText().sc_str,
    },
    {
      key: "font",
      label: "font",
      type: "cycle",
      values: ["pixel", "plain"],
      text: (value) =>
        value === "pixel" ? getText().f_pixel : getText().f_plain,
    },
    {
      key: "textSize",
      label: "textSize",
      type: "cycle",
      values: ["sm", "md", "lg"],
      text: (value) => getText()["ts_" + value],
    },
    {
      key: "lang",
      label: "lang",
      type: "cycle",
      values: ["EN", "LT"],
      text: (value) => value,
    },
  ];
  let selected = 0;
  const optionsElement = $("opts");

  function paint() {
    const language = getText();
    optionsElement.innerHTML = "";
    options.forEach((option, index) => {
      const row = document.createElement("div");
      row.className = "row" + (index === selected ? " focused" : "");
      const label = document.createElement("span");
      label.className = "label";
      label.textContent = language[option.label];
      row.appendChild(label);
      if (option.type === "slider") {
        const slider = document.createElement("div");
        slider.className = "slider";
        for (let value = 1; value <= 12; value++) {
          const cell = document.createElement("i");
          if (value <= Store.get(option.key)) cell.classList.add("on");
          cell.addEventListener("click", () => {
            Store.set(option.key, value);
            selected = index;
            paint();
            Sound.tick();
          });
          slider.appendChild(cell);
        }
        row.appendChild(slider);
      } else {
        const button = document.createElement("button");
        button.className = "cycle";
        button.type = "button";
        const left = document.createElement("span");
        left.className = "arw";
        left.textContent = "◀";
        const value = document.createElement("span");
        value.className = "val";
        value.textContent = option.text(Store.get(option.key));
        const right = document.createElement("span");
        right.className = "arw";
        right.textContent = "▶";
        button.append(left, value, right);
        button.addEventListener("click", () => {
          selected = index;
          cycle(1);
        });
        row.appendChild(button);
      }
      row.addEventListener("pointerenter", () => {
        if (selected !== index) {
          selected = index;
          paint();
        }
      });
      optionsElement.appendChild(row);
    });
    $("set-title").textContent = language.setTitle;
    $("hint-set").textContent = language.hintSet;
  }

  function cycle(direction) {
    const option = options[selected];
    if (option.type === "slider") {
      Store.set(
        option.key,
        Math.max(0, Math.min(12, Store.get(option.key) + direction)),
      );
      Sound.tick();
    } else {
      const values = option.values;
      Store.set(
        option.key,
        values[
          (values.indexOf(Store.get(option.key)) + direction + values.length) %
            values.length
        ],
      );
      Sound.move();
      if (option.key === "scaling") fit();
      if (option.key === "font") applyFont();
      if (option.key === "textSize") applyTextSize();
      if (option.key === "quality") scene.rebake();
      if (option.key === "lang") onLanguageChange();
    }
    paint();
  }

  UI.register("settings", {
    el: "s-settings",
    back: () => getSettingsBack(),
    enter: paint,
    key(event) {
      if (event.key === "ArrowUp" || event.key === "w") {
        selected = (selected - 1 + options.length) % options.length;
        paint();
        Sound.move();
      }
      if (event.key === "ArrowDown" || event.key === "s") {
        selected = (selected + 1) % options.length;
        paint();
        Sound.move();
      }
      if (event.key === "ArrowLeft" || event.key === "a") cycle(-1);
      if (event.key === "ArrowRight" || event.key === "d") cycle(1);
    },
  });

  return { paint, cycle };
}
