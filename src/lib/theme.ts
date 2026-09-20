export type ThemeMode = "light" | "dark" | "system";
export type ThemeAccent = "violet" | "blue" | "green" | "rose" | "orange" | "slate";

export const THEME_MODE_KEY = "ascend:theme-mode";
export const THEME_ACCENT_KEY = "ascend:theme-accent";

// Mirrored into cookies (not just localStorage) so the server can render the
// right theme on the very first response — localStorage alone is vulnerable
// to private-browsing restrictions and PWA storage quirks that silently drop
// the write, which shows up as "my theme resets on refresh".
export const THEME_MODE_COOKIE = "ascend-theme-mode";
export const THEME_ACCENT_COOKIE = "ascend-theme-accent";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const MODE_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const ACCENT_OPTIONS: { value: ThemeAccent; label: string; swatch: string }[] = [
  { value: "violet", label: "Violet", swatch: "#6d28d9" },
  { value: "blue", label: "Blue", swatch: "#2563eb" },
  { value: "green", label: "Green", swatch: "#15803d" },
  { value: "rose", label: "Rose", swatch: "#e11d48" },
  { value: "orange", label: "Orange", swatch: "#ea580c" },
  { value: "slate", label: "Slate", swatch: "#334155" },
];

export function isThemeMode(value: string | undefined | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function isThemeAccent(value: string | undefined | null): value is ThemeAccent {
  return ACCENT_OPTIONS.some((opt) => opt.value === value);
}

export function applyTheme(mode: ThemeMode, accent: ThemeAccent): void {
  const root = document.documentElement;

  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);

  if (accent === "violet") root.removeAttribute("data-accent");
  else root.setAttribute("data-accent", accent);
}

/**
 * Reads back the theme actually applied to the page (set by the server from
 * the cookie, or by THEME_INIT_SCRIPT from localStorage) rather than
 * re-deriving it from a specific storage mechanism — so the settings UI
 * always matches what's on screen.
 */
export function readStoredTheme(): { mode: ThemeMode; accent: ThemeAccent } {
  if (typeof document === "undefined") return { mode: "system", accent: "violet" };
  const themeAttr = document.documentElement.getAttribute("data-theme");
  const accentAttr = document.documentElement.getAttribute("data-accent");
  return {
    mode: isThemeMode(themeAttr) ? themeAttr : "system",
    accent: isThemeAccent(accentAttr) ? accentAttr : "violet",
  };
}

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function storeTheme(mode: ThemeMode, accent: ThemeAccent): void {
  // The cookie is the source of truth (read by the server on every request);
  // localStorage is kept only so the settings UI can read back the choice
  // instantly on the client without waiting on a round trip.
  writeCookie(THEME_MODE_COOKIE, mode);
  writeCookie(THEME_ACCENT_COOKIE, accent);
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);
    localStorage.setItem(THEME_ACCENT_KEY, accent);
  } catch {
    // Private browsing / storage disabled — the cookie above still persists the choice.
  }
}

/** Inlined into <head> so the saved theme applies before first paint, avoiding a flash of the default theme. */
export const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem("${THEME_MODE_KEY}");var a=localStorage.getItem("${THEME_ACCENT_KEY}");if(m==="light"||m==="dark")document.documentElement.setAttribute("data-theme",m);if(a&&a!=="violet")document.documentElement.setAttribute("data-accent",a);}catch(e){}})();`;
