const PIXEL_FACE = '"Pixelify Sans"';
const REQUIRED_GLYPHS = "\u017D\u0117\u0173";
const WEIGHTS = [400, 500, 600, 700];

export function createFontGuard({ root, isAlive, applyTextSize }) {
  let stopped = false;

  async function check() {
    if (stopped || !isAlive() || !document.fonts) return;
    try {
      await Promise.all(
        WEIGHTS.map((weight) =>
          document.fonts.load(weight + " 15px " + PIXEL_FACE, REQUIRED_GLYPHS),
        ),
      );
    } catch {}
    if (stopped || !isAlive()) return;
    const loaded = document.fonts.check
      ? WEIGHTS.every((weight) =>
          document.fonts.check(weight + " 15px " + PIXEL_FACE, REQUIRED_GLYPHS),
        )
      : true;
    root.classList.toggle("nopix", !loaded);
    applyTextSize();
  }

  return {
    start() {
      check();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(check);
      }
    },
    stop() {
      stopped = true;
    },
  };
}
