"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function SignOutButton({ className, label }: { className?: string; label?: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      aria-label="Sign out"
      className={cn(
        "flex items-center gap-2 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <LogOut className="size-4" />
      {label}
    </button>
  );
}
