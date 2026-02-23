import { createClient } from "@/lib/supabase/client";

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

function getSupabase() {
  return createClient();
}

export async function getChats(): Promise<Chat[]> {
  const supabase = getSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("[chat-history] auth error:", authError.message);
    return [];
  }
  if (!user) {
    console.warn("[chat-history] getChats: no user");
    return [];
  }

  const { data, error } = await supabase
    .from("chats")
    .select("id, title, model, is_supervisor, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[chat-history] getChats error:", error.message);
    return [];
  }

  return data || [];
}

export async function createChat(
  model: string,
  isSupervisor: boolean
): Promise<Chat | null> {
  const supabase = getSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("[chat-history] auth error:", authError.message);
    return null;
  }
  if (!user) {
    console.warn("[chat-history] createChat: no user");
    return null;
  }

  const { data, error } = await supabase
    .from("chats")
    .insert({
      user_id: user.id,
      title: "New Chat",
      model,
      is_supervisor: isSupervisor,
    })
    .select()
    .single();

  if (error) {
    console.error("[chat-history] createChat error:", error.message);
    return null;
  }

  return data;
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, model, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[chat-history] getChatMessages error:", error.message);
    return [];
  }

  return data || [];
}

export async function saveMessage(
  chatId: string,
  role: string,
  content: string,
  model?: string
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("messages")
    .insert({ chat_id: chatId, role, content, model });

  if (error) {
    console.error("[chat-history] saveMessage error:", error.message);
    return;
  }

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
  const supabase = getSupabase();
  const { error } = await supabase.from("chats").delete().eq("id", chatId);
  if (error) {
    console.error("[chat-history] deleteChat error:", error.message);
  }
}
