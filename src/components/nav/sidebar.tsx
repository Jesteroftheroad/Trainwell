"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Sidebar({ fullName, streak }: { fullName: string | null; streak: number }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 flex-col border-r border-border bg-card px-4 py-6 md:flex">
      <div className="flex items-center gap-2 px-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black">
          A
        </div>
        <span className="text-lg font-black tracking-tight">Ascend</span>
      </div>

      <nav aria-label="Primary" className="mt-8 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-primary-soft text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between rounded-xl bg-muted px-3 py-2.5 text-sm font-semibold">
        <span className="flex items-center gap-1.5">
          <Flame className="size-4 text-warning" />
          {streak} day streak
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between px-1">
        <span className="truncate text-sm font-medium text-muted-foreground">
          {fullName ?? "Athlete"}
        </span>
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}
