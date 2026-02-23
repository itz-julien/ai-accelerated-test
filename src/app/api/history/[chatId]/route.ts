import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Get messages for a specific chat
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, role, content, model, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages });
}

// Save a message to a chat
export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role, content, model } = await req.json();

  const { data: message, error } = await supabase
    .from("messages")
    .insert({ chat_id: chatId, role, content, model })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update chat title from first user message and bump updated_at
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (role === "user") {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("chat_id", chatId);
    if (count === 1) {
      updates.title = content.slice(0, 80);
    }
  }

  await supabase.from("chats").update(updates).eq("id", chatId);

  return NextResponse.json({ message });
}

// Delete a chat
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("chats").delete().eq("id", chatId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
