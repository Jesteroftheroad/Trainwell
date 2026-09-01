"use client";

import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  disablePushNotifications,
  enablePushNotifications,
  getExistingPushSubscription,
} from "@/lib/push/client";

export function PushNotificationToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null); // null = still checking
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getExistingPushSubscription().then((sub) => setEnabled(Boolean(sub)));
  }, []);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = enabled ? await disablePushNotifications() : await enablePushNotifications();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setEnabled((prev) => !prev);
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
      <div className="min-w-0">
        <p className="text-sm font-bold">Daily workout reminder</p>
        <p className="text-xs text-muted-foreground">
          A push notification around 8am on days you have a workout scheduled.
        </p>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
      <button
        role="switch"
        aria-checked={enabled ?? false}
        aria-label="Daily workout reminder"
        disabled={enabled === null || isPending}
        onClick={handleToggle}
        className={cn(
          "flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors disabled:opacity-50",
          enabled ? "justify-end bg-primary" : "justify-start bg-muted",
        )}
      >
        <span className="size-5 rounded-full bg-white shadow" />
      </button>
    </div>
  );
}
