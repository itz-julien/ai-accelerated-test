import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // Test DB access
  const { data: chats, error: dbError } = await supabase
    .from("chats")
    .select("id")
    .limit(1);

  return NextResponse.json({
    auth: {
      user: user ? { id: user.id, email: user.email } : null,
      error: userError?.message || null,
    },
    db: {
      accessible: !dbError,
      error: dbError?.message || null,
      chatsExist: chats !== null,
    },
  });
}
