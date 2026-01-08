import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PATCH(request: Request, props: { params: Promise<{ userId: string }> }) {
  try {
    const params = await props.params
    const { userId } = params
    const { full_name } = await request.json()

    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { full_name },
    })

    if (error) {
      console.error("[v0] Error updating user:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: data.user })
  } catch (error) {
    console.error("[v0] Error in user update API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
