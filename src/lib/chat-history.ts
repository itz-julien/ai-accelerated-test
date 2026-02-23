import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface Chat {
  id: string;
  title: string;
  model: string;
  is_supervisor: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  model: string | null;
  created_at: string;
}

export async function getChats(): Promise<Chat[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("chats")
    .select("id, title, model, is_supervisor, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  return data || [];
}

export async function createChat(model: string, isSupervisor: boolean): Promise<Chat | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("chats")
    .insert({
      user_id: user.id,
      title: "New Chat",
      model,
      is_supervisor: isSupervisor,
    })
    .select()
    .single();

  return data;
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  const { data } = await supabase
    .from("messages")
    .select("id, role, content, model, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  return data || [];
}

export async function saveMessage(
  chatId: string,
  role: string,
  content: string,
  model?: string
): Promise<void> {
  await supabase
    .from("messages")
    .insert({ chat_id: chatId, role, content, model });

  // Update chat title from first user message + bump updated_at
  if (role === "user") {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("chat_id", chatId);

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (count === 1) {
      updates.title = content.slice(0, 80);
    }
    await supabase.from("chats").update(updates).eq("id", chatId);
  }
}

export async function deleteChat(chatId: string): Promise<void> {
  await supabase.from("chats").delete().eq("id", chatId);
}
