import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface ConversationSummary {
  id: string;
  type: "coach" | "system";
  title: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, type, coach_id, profiles:coach_id ( full_name )")
    .or(`client_id.eq.${userId},coach_id.eq.${userId}`);

  if (error || !conversations) return [];

  const results: ConversationSummary[] = [];
  for (const conversation of conversations) {
    const { data: messages } = await supabase
      .from("messages")
      .select("body, created_at, read_at, sender_id")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const last = messages?.[0];
    const unreadCount =
      messages?.filter((m) => m.sender_id !== userId && !m.read_at).length ?? 0;

    const coachProfile = conversation.profiles;

    results.push({
      id: conversation.id,
      type: conversation.type,
      title:
        conversation.type === "system"
          ? "Coaching Team"
          : (coachProfile?.full_name ?? "Your Coach"),
      lastMessage: last?.body ?? null,
      lastMessageAt: last?.created_at ?? null,
      unreadCount,
    });
  }

  return results.sort((a, b) => {
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return b.lastMessageAt.localeCompare(a.lastMessageAt);
  });
}

export interface MessageItem {
  id: string;
  body: string;
  createdAt: string;
  senderId: string | null;
  isMine: boolean;
}

export async function getMessages(conversationId: string, userId: string): Promise<MessageItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, body, created_at, sender_id")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.created_at,
    senderId: m.sender_id,
    isMine: m.sender_id === userId,
  }));
}
