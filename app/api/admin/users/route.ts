import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error("[v0] Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    const formattedUsers = users.users.map((user) => ({
      id: user.id,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || null,
      created_at: user.created_at,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("[v0] Error in users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
