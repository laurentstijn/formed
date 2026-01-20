import { NextResponse } from "next/server"
import { setDemoMode } from "@/lib/supabase/demo-mode"

export async function POST(request: Request) {
  try {
    const { enabled } = await request.json()

    const result = await setDemoMode(enabled)

    if (result.success) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  } catch (error) {
    console.error("Error toggling demo mode:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
