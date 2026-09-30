const KEY = "zvejyba.guest-progress.v1";

export function createGuestProgress({ onChange, storage = localStorage, request = fetch }) {
  let state = { profile: null, status: "loading", pending: 0, leveledUp: false };
  let running = null;
  let stopped = false;
  let controller = null;

  function read() {
    const saved = storage.getItem(KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (!/^[a-f0-9]{64}$/.test(data.token) || !Array.isArray(data.pending)) {
        throw new Error("Invalid saved guest profile");
      }
      return data;
    }
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)),
      (byte) => byte.toString(16).padStart(2, "0")).join("");
    const data = { token, pending: [] };
    storage.setItem(KEY, JSON.stringify(data));
    return data;
  }

  function publish(next) {
    state = { ...state, ...next };
    if (!stopped) onChange(state);
  }

  async function post(path, body, token) {
    controller = new AbortController();
    const timeout = setTimeout(() => controller?.abort(), 10000);
    try {
      const response = await request(`/api/progress/${path}`, {
        method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`Progress request failed (${response.status})`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async function sync() {
    try {
      const data = read();
      publish({ status: "saving", pending: data.pending.length, leveledUp: false });
      const profile = await post("guest", {}, data.token);
      if (stopped) return;
      publish({ profile });
      while (!stopped) {
        const next = read().pending[0];
        if (!next) break;
        const result = await post("catches", { catchId: next }, data.token);
        // Remove only the acknowledged receipt, preserving catches added during the request.
        const current = read();
        current.pending = current.pending.filter((id) => id !== next);
        storage.setItem(KEY, JSON.stringify(current));
        publish({ profile: result, pending: current.pending.length,
          leveledUp: state.leveledUp || result.stats.level > state.profile.stats.level });
      }
      publish({ status: "saved" });
    } catch {
      publish({ status: "error" });
    }
  }

  function refresh() {
    if (stopped) return Promise.resolve();
    if (!running) running = sync().finally(() => { running = null; });
    return running;
  }

  return {
    refresh,
    recordCatch() {
      try {
        const data = read();
        data.pending.push(crypto.randomUUID());
        storage.setItem(KEY, JSON.stringify(data));
        publish({ pending: data.pending.length });
        return refresh();
      } catch {
        publish({ status: "error" });
        return Promise.resolve();
      }
    },
    stop() { stopped = true; controller?.abort(); },
  };
}
