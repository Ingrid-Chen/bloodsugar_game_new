import { addParticipant } from "@/lib/stats-store"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const nickname = body?.nickname != null ? String(body.nickname).trim() : ""
    if (nickname) await addParticipant(nickname)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[api/participate]", e)
    return NextResponse.json({ ok: false })
  }
}
