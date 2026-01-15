import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase.from("product_variants").insert(body).select().single()

    if (error) {
      console.error("Error creating variant:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in variant creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")

    if (!productId || productId === "undefined" || productId === "null") {
      console.error("[v0] Invalid product_id:", productId)
      return NextResponse.json({ error: "Valid Product ID required" }, { status: 400 })
    }

    // No need to parse - just pass the ID directly to Supabase
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .eq("is_active", true)
      .order("name")

    if (error) {
      console.error("[v0] Error fetching variants:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching variants:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
