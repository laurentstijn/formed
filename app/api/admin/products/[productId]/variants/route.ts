import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch all variants for a product
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const supabase = await createServerClient()

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", params.productId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching variants:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ variants: variants || [] })
  } catch (error) {
    console.error("[v0] Unexpected error fetching variants:", error)
    return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 })
  }
}

// POST - Create a new variant
export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const variantData = {
      product_id: params.productId,
      name: body.name,
      price: body.price,
      stock: body.stock || 0,
      sku: body.sku || "",
      colors: body.colors || [],
      gallery_images: body.gallery_images || [],
      technical_drawing: body.technical_drawing || null,
      is_active: body.is_active ?? true,
    }

    const { data: variant, error } = await supabase.from("product_variants").insert(variantData).select().single()

    if (error) {
      console.error("[v0] Error creating variant:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ variant })
  } catch (error) {
    console.error("[v0] Unexpected error creating variant:", error)
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 })
  }
}
