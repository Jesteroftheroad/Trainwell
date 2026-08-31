import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip Next.js internals and any public static asset (icons, manifest,
  // service worker, images) so unauthenticated requests for them don't
  // bounce through the login redirect.
  matcher: ["/((?!_next/static|_next/image|sw\\.js|manifest\\.webmanifest|.*\\.(?:ico|svg|png|jpg|jpeg|webp|json)$).*)"],
};
