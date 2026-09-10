const defaults = {
  music: 6,
  sfx: 9,
  quality: "high",
  scaling: "integer",
  font: "pixel",
  textSize: "md",
  lang: "EN",
};

const KEY = "zvejyba.settings";

export function createSettingsStore() {
  let mem = { ...defaults };

  return {
    all: () => ({ ...mem }),
    get: (key) => mem[key],
    set(key, value) {
      mem[key] = value;
      try {
        localStorage.setItem(KEY, JSON.stringify(mem));
      } catch {
        /* private mode */
      }
    },
    load() {
      try {
        mem = {
          ...defaults,
          ...JSON.parse(localStorage.getItem(KEY) || "{}"),
        };
      } catch {
        mem = { ...defaults };
      }
      return this.all();
    },
  };
}
