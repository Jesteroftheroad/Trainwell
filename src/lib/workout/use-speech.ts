"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "ascend:voice-enabled";

function readStoredPreference(): boolean {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === "true";
}

/** Free, built-in browser text-to-speech (SpeechSynthesis) — no API key, no cost. */
export function useSpeech() {
  const [enabled, setEnabledState] = useState<boolean>(readStoredPreference);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, String(next));
    if (!next && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!enabled) return;
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    },
    [enabled],
  );

  return { enabled, setEnabled, speak };
}
