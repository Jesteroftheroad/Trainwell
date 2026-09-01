import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip Next.js internals, any public static asset (icons, manifest,
  // service worker, images), and API routes (they authenticate themselves —
  // e.g. /api/cron/* checks a bearer secret, not a user session) so those
  // requests don't bounce through the login redirect.
  matcher: [
    "/((?!api/|_next/static|_next/image|sw\\.js|manifest\\.webmanifest|.*\\.(?:ico|svg|png|jpg|jpeg|webp|json)$).*)",
  ],
};
