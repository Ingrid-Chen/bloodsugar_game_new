import { incrementVisitCount } from "@/lib/stats-store"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const visitCount = await incrementVisitCount()
    return NextResponse.json({ visitCount })
  } catch (e) {
    console.error("[api/visit]", e)
    return NextResponse.json({ visitCount: 0 })
  }
}
