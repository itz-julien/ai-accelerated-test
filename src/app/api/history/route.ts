import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Get all chats for current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: chats, error } = await supabase
    .from("chats")
    .select("id, title, model, is_supervisor, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chats });
}

// Create a new chat
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, model, is_supervisor } = await req.json();

  const { data: chat, error } = await supabase
    .from("chats")
    .insert({
      user_id: user.id,
      title: title || "New Chat",
      model: model || "gpt-4o",
      is_supervisor: is_supervisor || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chat });
}
