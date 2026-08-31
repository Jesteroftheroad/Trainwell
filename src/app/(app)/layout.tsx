import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { TimezoneSync } from "@/components/timezone-sync";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentUserAndProfile();

  return (
    <div className="flex min-h-dvh">
      <Sidebar fullName={profile?.full_name ?? null} streak={profile?.current_streak ?? 0} />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <BottomNav />
      <TimezoneSync currentTimezone={profile?.timezone ?? "UTC"} />
    </div>
  );
}
