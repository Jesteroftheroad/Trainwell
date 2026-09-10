"use client";

import { useEffect, useRef } from "react";

/**
 * Requests a screen wake lock while `active` is true, so the screen doesn't
 * auto-sleep mid-timer in the first place. This is a best-effort addition on
 * top of the timestamp-based countdown in use-countdown.ts, not a substitute
 * for it — the wake lock is unsupported in some browsers, gets silently
 * denied in others, and can't stop a user from manually locking their phone,
 * so the countdown still has to self-correct on resume regardless.
 */
export function useWakeLock(active: boolean): void {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let cancelled = false;

    async function acquire() {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release().catch(() => {});
          return;
        }
        lockRef.current = lock;
      } catch {
        // Denied or unsupported in this context — nothing to do, the
        // timestamp-based countdown still keeps correct time regardless.
      }
    }

    acquire();

    // The lock is released automatically when the tab is hidden; re-acquire
    // it once the user comes back while the timer is still active.
    function handleVisibility() {
      if (document.visibilityState === "visible" && !lockRef.current) acquire();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
    };
  }, [active]);
}
