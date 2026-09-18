export type ThemeMode = "light" | "dark" | "system";
export type ThemeAccent = "violet" | "blue" | "green" | "rose" | "orange" | "slate";

export const THEME_MODE_KEY = "ascend:theme-mode";
export const THEME_ACCENT_KEY = "ascend:theme-accent";

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

export function applyTheme(mode: ThemeMode, accent: ThemeAccent): void {
  const root = document.documentElement;

  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);

  if (accent === "violet") root.removeAttribute("data-accent");
  else root.setAttribute("data-accent", accent);
}

export function readStoredTheme(): { mode: ThemeMode; accent: ThemeAccent } {
  if (typeof window === "undefined") return { mode: "system", accent: "violet" };
  try {
    const mode = (localStorage.getItem(THEME_MODE_KEY) as ThemeMode | null) ?? "system";
    const accent = (localStorage.getItem(THEME_ACCENT_KEY) as ThemeAccent | null) ?? "violet";
    return { mode, accent };
  } catch {
    return { mode: "system", accent: "violet" };
  }
}

export function storeTheme(mode: ThemeMode, accent: ThemeAccent): void {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);
    localStorage.setItem(THEME_ACCENT_KEY, accent);
  } catch {
    // Private browsing / storage disabled — the choice just won't persist across visits.
  }
}

/** Inlined into <head> so the saved theme applies before first paint, avoiding a flash of the default theme. */
export const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem("${THEME_MODE_KEY}");var a=localStorage.getItem("${THEME_ACCENT_KEY}");if(m==="light"||m==="dark")document.documentElement.setAttribute("data-theme",m);if(a&&a!=="violet")document.documentElement.setAttribute("data-accent",a);}catch(e){}})();`;
