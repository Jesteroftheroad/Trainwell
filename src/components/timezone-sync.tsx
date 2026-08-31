"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateTimezone } from "@/lib/profile/actions";

/**
 * Detects the browser's IANA timezone and saves it on the profile if it's
 * stale (default 'UTC', or the user travelled) so every server-side "today"
 * calculation lines up with the visitor's actual local date.
 */
export function TimezoneSync({ currentTimezone }: { currentTimezone: string }) {
  const router = useRouter();

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected && detected !== currentTimezone) {
      updateTimezone(detected).then(() => router.refresh());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
