const KEY = "zvejyba.guest-progress.v1";

export function createGuestProgress({
  onChange,
  accountId = null,
  onSessionExpired,
  storage = localStorage,
  request = fetch,
}) {
  const storageKey = accountId ? `zvejyba.account-progress.${accountId}` : KEY;
  let state = { profile: null, status: "loading", pending: 0, leveledUp: false, lastAward: null };
  let running = null;
  let stopped = false;
  let controller = null;

  function read() {
    const saved = storage.getItem(storageKey);
    if (saved) {
      const data = JSON.parse(saved);
      if ((!accountId && !/^[a-f0-9]{64}$/.test(data.token)) || !Array.isArray(data.pending)) {
        throw new Error("Invalid saved guest profile");
      }
      data.pending = data.pending.map((item) =>
        typeof item === "string" ? { catchId: item, fish: null } : item,
      );
      return data;
    }
    const token = accountId
      ? null
      : Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("");
    const data = { token, pending: [] };
    storage.setItem(storageKey, JSON.stringify(data));
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
        method: "POST",
        signal: controller.signal,
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "zvejyba",
          ...(!accountId ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...body, ...(accountId ? { accountId } : {}) }),
      });
      if (accountId && [401, 409].includes(response.status) && !stopped) onSessionExpired?.();
      if (!response.ok) throw new Error(`Progress request failed (${response.status})`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async function sync() {
    try {
      const data = read();
      publish({ status: "saving", pending: data.pending.length, leveledUp: false, lastAward: null });
      const profile = await post(accountId ? "account" : "guest", {}, data.token);
      if (stopped) return;
      publish({ profile });
      while (!stopped) {
        const next = read().pending[0];
        if (!next) break;
        const result = await post(
          accountId ? "account/catches" : "catches",
          { catchId: next.catchId, fish: next.fish },
          data.token,
        );
        const current = read();
        current.pending = current.pending.filter((item) => item.catchId !== next.catchId);
        storage.setItem(storageKey, JSON.stringify(current));
        publish({
          profile: result,
          pending: current.pending.length,
          leveledUp: state.leveledUp || Boolean(result.leveledUp) || result.stats.level > state.profile.stats.level,
          lastAward: {
            xp: result.awardedXp || 0,
            coins: result.awardedCoins || 0,
            fishPayout: result.fishPayout || 0,
          },
        });
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
    recordCatch(fish = null) {
      try {
        const data = read();
        data.pending.push({ catchId: crypto.randomUUID(), fish: fish || null });
        storage.setItem(storageKey, JSON.stringify(data));
        publish({ pending: data.pending.length });
        return refresh();
      } catch {
        publish({ status: "error" });
        return Promise.resolve();
      }
    },
    stop() {
      stopped = true;
      controller?.abort();
    },
  };
}