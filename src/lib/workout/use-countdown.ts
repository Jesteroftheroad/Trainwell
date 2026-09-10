import { useCallback, useEffect, useRef, useState } from "react";

function secondsLeft(endAt: number): number {
  return Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
}

/**
 * A countdown driven by a wall-clock deadline rather than by counting ticks.
 * A plain `setInterval` that decrements a counter drifts or fully stops once
 * the screen locks or the tab is backgrounded (mobile browsers throttle or
 * suspend JS timers there), which made this look "paused" instead of just
 * running. Recomputing `endAt - Date.now()` on every tick — and again on
 * `visibilitychange`/`focus` — means the instant the screen comes back on,
 * the countdown snaps to the real remaining time (or fires `onComplete`
 * immediately if it already ran out) instead of resuming from where the last
 * tick happened to land.
 */
export function useCountdown(totalSeconds: number, onComplete: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [trackedTotal, setTrackedTotal] = useState(totalSeconds);
  const onCompleteRef = useRef(onComplete);
  const endAtRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  // Keep the latest onComplete without re-subscribing the tick effect below.
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  // Reset whenever the caller hands us a new duration (e.g. moving to the
  // next set, or editing a timed set's length before starting it). This only
  // touches state, not the endAt/fired refs — those are inert until the next
  // `start()` call (which always sets them fresh), because `isRunning` going
  // false here also tears down the tick effect that's the only thing that
  // reads them.
  if (totalSeconds !== trackedTotal) {
    setTrackedTotal(totalSeconds);
    setRemaining(totalSeconds);
    setIsRunning(false);
  }

  const tick = useCallback(() => {
    if (endAtRef.current == null) return;
    const left = secondsLeft(endAtRef.current);
    setRemaining(left);
    if (left <= 0 && !firedRef.current) {
      firedRef.current = true;
      setIsRunning(false);
      onCompleteRef.current();
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return undefined;

    // A short interval keeps the on-screen number smooth while foregrounded;
    // it doesn't matter that the interval itself can be throttled or paused
    // in the background, because `tick` always recomputes from the absolute
    // deadline rather than trusting how many ticks actually fired.
    const interval = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    window.addEventListener("pageshow", tick);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
      window.removeEventListener("pageshow", tick);
    };
  }, [isRunning, tick]);

  const start = useCallback(() => {
    endAtRef.current = Date.now() + totalSeconds * 1000;
    firedRef.current = false;
    setRemaining(totalSeconds);
    setIsRunning(true);
  }, [totalSeconds]);

  const pause = useCallback(() => {
    if (endAtRef.current != null) setRemaining(secondsLeft(endAtRef.current));
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    endAtRef.current = null;
    firedRef.current = false;
    setRemaining(totalSeconds);
    setIsRunning(false);
  }, [totalSeconds]);

  return { remaining, isRunning, start, pause, reset };
}
