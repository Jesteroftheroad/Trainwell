"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendMessage } from "@/lib/chat/actions";
import { cn } from "@/lib/utils";
import type { MessageItem } from "@/lib/chat/queries";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function MessageThread({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: MessageItem[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    const optimisticId = `optimistic-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: optimisticId, body: trimmed, createdAt: new Date().toISOString(), senderId: "me", isMine: true },
    ]);
    setDraft("");

    startTransition(async () => {
      const result = await sendMessage(conversationId, trimmed);
      if ("error" in result) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }
    });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-40 md:pb-24">
        {messages.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Say hello to start the conversation.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.isMine ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                m.isMine
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-muted text-foreground",
              )}
            >
              <p>{m.body}</p>
              <p
                className={cn(
                  "mt-1 text-[10px]",
                  m.isMine ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {formatTime(m.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-2 border-t border-border bg-card p-3 md:bottom-0 md:left-64"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message your coach…"
          aria-label="Message"
          className="h-11 flex-1 rounded-full border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon" disabled={isPending || !draft.trim()} aria-label="Send message">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
