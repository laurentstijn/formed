import { NextResponse } from "next/server"
import { getDemoMode } from "@/lib/supabase/demo-mode"

export async function GET() {
  try {
    const enabled = await getDemoMode()
    return NextResponse.json({ enabled })
  } catch (error) {
    console.error("Error checking demo mode:", error)
    return NextResponse.json({ enabled: false })
  }
}
