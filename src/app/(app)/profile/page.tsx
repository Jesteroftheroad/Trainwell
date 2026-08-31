import Link from "next/link";
import { X } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getLifetimeStats } from "@/lib/progress/queries";
import { daysSince } from "@/lib/date";
import { SignOutButton } from "@/components/sign-out-button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfilePage() {
  const { userId, email, profile } = await getCurrentUserAndProfile();
  const stats = await getLifetimeStats(userId);

  const initial = (profile?.full_name ?? "A").trim().charAt(0).toUpperCase();
  const daysWithAscend = profile?.created_at ? daysSince(profile.created_at) : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-10 sm:px-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-black">Profile</h1>
        <Link
          href="/today"
          aria-label="Close"
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <X className="size-5" />
        </Link>
      </header>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-2xl font-black text-accent-foreground">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{profile?.full_name ?? "Athlete"}</p>
          <p className="truncate text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Lifetime stats
        </h2>
        <Card className="mt-3">
          <CardContent className="grid grid-cols-3 gap-3 p-4">
            <Stat label="Days w/ Ascend" value={daysWithAscend} />
            <Stat label="Workouts" value={stats.totalWorkouts} />
            <Stat label="Time exercised" value={`${stats.totalHoursExercised}h`} />
          </CardContent>
        </Card>
      </section>

      <SignOutButton
        label="Sign out"
        className="mt-8 w-full justify-center rounded-2xl border border-border py-3 text-sm font-semibold"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-muted p-3 text-center">
      <span className="text-xl font-black">{value}</span>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
