"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failures (unsupported browser, dev-mode HTTP) are non-fatal.
      });
    }
  }, []);

  return null;
}
