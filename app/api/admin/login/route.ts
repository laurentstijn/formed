import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log("[v0] Admin login attempt for email:", email)

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if email exists in admins table
    const supabase = await createServerClient()
    const { data: adminData, error } = await supabase.from("admins").select("*").eq("email", email).single()

    console.log("[v0] Admin lookup result - data:", adminData, "error:", error)

    if (error || !adminData) {
      console.log("[v0] Admin not found or error occurred")
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    const response = NextResponse.json({ success: true, email })

    response.cookies.set("admin_email", email, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("[v0] Admin cookie set in response headers for:", email)

    return response
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
