import { NextResponse } from "next/server";

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1397915933351088189/i8CcCOjcSD6yaKmmn8sKhhn3sJL2Ja1xMDV90JWRqCw5Zy96yWsX_VfEYGG9BmCYKN_e";

export async function POST(req: Request) {
  try {
    const { email, action } = await req.json();

    const emoji = action === "signup" ? "🆕" : "🔑";
    const label = action === "signup" ? "New signup" : "Login";

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `${emoji} **${label}** — \`${email}\``,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
