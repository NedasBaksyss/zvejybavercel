const rawBase = import.meta.env.VITE_API_BASE_URL?.trim();

const computedBase = (() => {
  if (rawBase) {
    return rawBase.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return ;
    }
  }

  return "";
})();

const absoluteUrlPattern = /^https?:\/\//i;

export function buildApiUrl(path = "") {
  if (!path) {
    return computedBase || "/";
  }

  if (absoluteUrlPattern.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : "";
  return computedBase ? "" : normalizedPath;
}

export function apiFetch(path, options) {
  return fetch(buildApiUrl(path), options);
}
