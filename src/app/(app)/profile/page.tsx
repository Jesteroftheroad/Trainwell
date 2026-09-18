import Link from "next/link";
import { CalendarRange, ChevronRight, Hammer, Settings, X } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getLifetimeStats } from "@/lib/progress/queries";
import { getCurrentEnrollment } from "@/lib/programs/queries";
import { daysSince } from "@/lib/date";
import { SignOutButton } from "@/components/sign-out-button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfilePage() {
  const { userId, email, profile } = await getCurrentUserAndProfile();
  const [stats, enrollment] = await Promise.all([getLifetimeStats(userId), getCurrentEnrollment(userId)]);

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

      <section className="mt-6">
        <Link href="/settings" className="block">
          <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-muted">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-accent-foreground">
              <Settings className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold">Settings</p>
              <p className="text-sm text-muted-foreground">Theme, notifications, and account</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Card>
        </Link>
      </section>

      <section className="mt-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Plan</h2>
        <Link href="/plans" className="mt-3 block">
          <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-muted">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-accent-foreground">
              <CalendarRange className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{enrollment?.programName ?? "No plan chosen"}</p>
              <p className="text-sm text-muted-foreground">
                {enrollment ? "Change plan" : "Choose a workout plan to get scheduled"}
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Card>
        </Link>
      </section>

      {profile?.role === "coach" && (
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Coach</h2>
          <Link href="/builder" className="mt-3 block">
            <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-muted">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-accent-foreground">
                <Hammer className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">Plan Builder</p>
                <p className="text-sm text-muted-foreground">Build and publish workout plans</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Card>
          </Link>
        </section>
      )}

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
