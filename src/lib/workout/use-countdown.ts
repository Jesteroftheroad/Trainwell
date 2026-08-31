import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(totalSeconds: number, onComplete: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [trackedTotal, setTrackedTotal] = useState(totalSeconds);
  const onCompleteRef = useRef(onComplete);

  // Keep the latest onComplete without re-subscribing the tick effect below.
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  // Reset whenever the caller hands us a new duration (e.g. moving to the next set).
  if (totalSeconds !== trackedTotal) {
    setTrackedTotal(totalSeconds);
    setRemaining(totalSeconds);
    setIsRunning(false);
  }

  useEffect(() => {
    if (!isRunning) return undefined;

    const timeout = setTimeout(() => {
      setRemaining((current) => {
        const next = current - 1;
        if (next <= 0) {
          setIsRunning(false);
          onCompleteRef.current();
        }
        return next;
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isRunning, remaining]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setRemaining(totalSeconds);
    setIsRunning(false);
  }, [totalSeconds]);

  return { remaining, isRunning, start, pause, reset };
}
