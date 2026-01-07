import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const adminEmail = request.cookies.get("admin_email")?.value

    console.log("[v0] Admin check - cookie value:", adminEmail)
    console.log(
      "[v0] Admin check - all cookies:",
      request.cookies.getAll().map((c) => c.name),
    )

    if (!adminEmail) {
      return NextResponse.json({ isAdmin: false })
    }

    // Verify the email still exists in admins table
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("admins").select("email").eq("email", adminEmail).single()

    if (error || !data) {
      console.log("[v0] Admin verification failed - error:", error)
      return NextResponse.json({ isAdmin: false })
    }

    console.log("[v0] Admin verified successfully:", adminEmail)
    return NextResponse.json({ isAdmin: true, email: adminEmail })
  } catch (error) {
    console.error("[v0] Admin check error:", error)
    return NextResponse.json({ isAdmin: false })
  }
}
