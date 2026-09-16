"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ACCENT_OPTIONS,
  MODE_OPTIONS,
  applyTheme,
  readStoredTheme,
  storeTheme,
  type ThemeAccent,
  type ThemeMode,
} from "@/lib/theme";

export function ThemeSettings() {
  const [mode, setMode] = useState<ThemeMode>(() => readStoredTheme().mode);
  const [accent, setAccent] = useState<ThemeAccent>(() => readStoredTheme().accent);

  function update(nextMode: ThemeMode, nextAccent: ThemeAccent) {
    setMode(nextMode);
    setAccent(nextAccent);
    applyTheme(nextMode, nextAccent);
    storeTheme(nextMode, nextAccent);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-4">
        <div>
          <p className="text-sm font-bold">Appearance</p>
          <div className="mt-2 flex gap-2">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update(opt.value, accent)}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                  mode === opt.value
                    ? "border-primary bg-primary-soft text-accent-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold">Theme color</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-label={opt.label}
                aria-pressed={accent === opt.value}
                onClick={() => update(mode, opt.value)}
                className="flex size-10 items-center justify-center rounded-full transition-transform"
                style={{
                  backgroundColor: opt.swatch,
                  boxShadow: accent === opt.value ? `0 0 0 2px var(--card), 0 0 0 4px ${opt.swatch}` : undefined,
                }}
              >
                {accent === opt.value && <Check className="size-4 text-white" />}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
