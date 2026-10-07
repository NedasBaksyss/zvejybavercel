export function createSound({ isAlive, getVolume, later }) {
  let actx = null;

  function blip(freq, dur, type = "square") {
    if (!isAlive() || getVolume() <= 0) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.06 * getVolume(), actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
      o.connect(g).connect(actx.destination);
      o.start();
      o.stop(actx.currentTime + dur);
    } catch {
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
        if (actx) actx.close();
      } catch {}
    },
  };
}
