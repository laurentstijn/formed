import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ exists: false })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("customers")
      .select("id, email")
      .eq("email", email.toLowerCase())
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ exists: false })
    }

    const exists = !!data

    return NextResponse.json({ exists })
  } catch (error) {
    return NextResponse.json({ exists: false })
  }
}
