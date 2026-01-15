import { type NextRequest, NextResponse } from "next/server"
import { getStandardColors, saveStandardColors } from "@/lib/supabase/settings"

export async function GET() {
  try {
    const colors = await getStandardColors()
    return NextResponse.json({ colors })
  } catch (error) {
    console.error("Error fetching standard colors:", error)
    return NextResponse.json({ error: "Failed to fetch colors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { colors } = await request.json()
    const result = await saveStandardColors(colors)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving standard colors:", error)
    return NextResponse.json({ error: "Failed to save colors" }, { status: 500 })
  }
}
