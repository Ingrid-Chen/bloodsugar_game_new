import { getStats } from "@/lib/stats-store"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { visitCount, participantCount } = await getStats()
    return NextResponse.json({ visitCount, participantCount })
  } catch (e) {
    console.error("[api/stats]", e)
    return NextResponse.json({ visitCount: 0, participantCount: 0 })
  }
}
