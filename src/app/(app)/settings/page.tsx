import Link from "next/link";
import { X } from "lucide-react";
import { PushNotificationToggle } from "@/components/push-notification-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSettings } from "@/components/settings/theme-settings";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-10 sm:px-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-black">Settings</h1>
        <Link
          href="/today"
          aria-label="Close"
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <X className="size-5" />
        </Link>
      </header>

      <section className="mt-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Appearance</h2>
        <div className="mt-3">
          <ThemeSettings />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Notifications
        </h2>
        <div className="mt-3">
          <PushNotificationToggle />
        </div>
      </section>

      <SignOutButton
        label="Sign out"
        className="mt-8 w-full justify-center rounded-2xl border border-border py-3 text-sm font-semibold"
      />
    </div>
  );
}
