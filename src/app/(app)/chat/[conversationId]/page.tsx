import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getConversations, getMessages } from "@/lib/chat/queries";
import { markConversationRead } from "@/lib/chat/actions";
import { MessageThread } from "@/components/chat/message-thread";
import { notFound } from "next/navigation";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const { userId } = await getCurrentUserAndProfile();

  const [conversations, messages] = await Promise.all([
    getConversations(userId),
    getMessages(conversationId, userId),
  ]);

  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation) notFound();

  await markConversationRead(conversationId);

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <Link
          href="/chat"
          aria-label="Back to conversations"
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-base font-bold">{conversation.title}</h1>
      </header>

      <MessageThread conversationId={conversationId} initialMessages={messages} />
    </div>
  );
}
