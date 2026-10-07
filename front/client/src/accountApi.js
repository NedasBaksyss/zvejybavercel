export function createAccountApi({ request = fetch } = {}) {
  async function send(path, body) {
    const response = await request(`/api/auth/${path}`, {
      method: body ? "POST" : "GET", credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-Requested-With": "zvejyba" },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(10000),
    });
    if (path === "session" && response.status === 401) return null;
    if (response.status === 204) return null;
    if (!response.headers.get("content-type")?.includes("application/json")) {
      throw new Error(`Account service returned HTTP ${response.status}. Please restart or rebuild the API.`);
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || "Account request failed");
    return { id: data.user.id, user: data.user };
  }
  return {
    register: (username, password, email) => send("register", { username, password, email }),
    login: (username, password) => send("user/login", { username, password }),
    current: () => send("session"),
    logout: () => send("logout", {}),
  };
}
