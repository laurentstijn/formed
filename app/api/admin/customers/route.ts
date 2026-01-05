import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: customers, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching customers:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(customers)
  } catch (error) {
    console.error("[v0] Error in customers API:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}
