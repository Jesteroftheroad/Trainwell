import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getConversations } from "@/lib/chat/queries";
import { Badge } from "@/components/ui/badge";

function formatTimestamp(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function ChatListPage() {
  const { userId } = await getCurrentUserAndProfile();
  const conversations = await getConversations(userId);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-10 sm:px-6">
      <h1 className="text-2xl font-black">Chat</h1>

      {conversations.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No conversations yet.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/60"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-accent-foreground">
                <MessageCircle className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold">{c.title}</p>
                  {c.unreadCount > 0 && <Badge>{c.unreadCount}</Badge>}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {c.lastMessage ?? "No messages yet"}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatTimestamp(c.lastMessageAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
