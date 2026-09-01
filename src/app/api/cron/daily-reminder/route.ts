import { NextResponse } from "next/server";
import webPush from "web-push";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getTodayIsoInTimezone } from "@/lib/date";

export const dynamic = "force-dynamic";

/**
 * Runs on a schedule (see vercel.json). For every push subscription whose
 * owner's local time is currently ~8am, sends a reminder if they have an
 * incomplete main workout scheduled today. Uses the service-role key because
 * it has to read across every user, bypassing RLS by design — this route
 * must stay behind CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return NextResponse.json({ error: "Push isn't configured." }, { status: 500 });
  }
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: subscriptions, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth, user_id, profiles(timezone)");

  if (error || !subscriptions) {
    return NextResponse.json({ error: error?.message ?? "Could not load subscriptions." }, { status: 500 });
  }

  let sent = 0;
  const scheduleCache = new Map<string, { name: string; status: string } | null>();

  for (const sub of subscriptions) {
    const timezone = sub.profiles?.timezone ?? "UTC";
    const localHour = Number(
      new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(
        new Date(),
      ),
    );
    if (localHour !== 8) continue;

    if (!scheduleCache.has(sub.user_id)) {
      const todayIso = getTodayIsoInTimezone(timezone);
      const { data: scheduled } = await supabaseAdmin
        .from("scheduled_workouts")
        .select("status, workouts(name)")
        .eq("user_id", sub.user_id)
        .eq("slot", "main")
        .eq("scheduled_date", todayIso)
        .maybeSingle();

      scheduleCache.set(
        sub.user_id,
        scheduled ? { name: scheduled.workouts?.name ?? "Your workout", status: scheduled.status } : null,
      );
    }

    const todaysWorkout = scheduleCache.get(sub.user_id);
    if (!todaysWorkout || todaysWorkout.status === "completed") continue;

    const payload = JSON.stringify({
      title: "Today's workout is ready",
      body: `${todaysWorkout.name} is on your schedule today.`,
      url: "/today",
    });

    try {
      await webPush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      );
      sent += 1;
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }
  }

  return NextResponse.json({ sent });
}
