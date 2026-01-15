import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch all variants for a product
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const supabase = await createServerClient()

    console.log("[v0 SERVER] GET variants request - productId param:", params.productId)
    console.log("[v0 SERVER] productId type:", typeof params.productId)

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", params.productId)
      .single()

    if (productError || !product) {
      console.error("[v0 SERVER] Error finding product:", productError?.message)
      console.error("[v0 SERVER] Product error details:", productError)
      return NextResponse.json({ variants: [] })
    }

    console.log("[v0 SERVER] Found product with ID:", product.id, "type:", typeof product.id)

    console.log("[v0 SERVER] Querying product_variants with product_id:", product.id)

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[v0 SERVER] Error fetching variants:", error.message)
      console.error("[v0 SERVER] Variants error full details:", JSON.stringify(error, null, 2))
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 },
      )
    }

    console.log("[v0 SERVER] Successfully found variants:", variants?.length || 0)
    if (variants && variants.length > 0) {
      console.log("[v0 SERVER] First variant:", JSON.stringify(variants[0], null, 2))
    }
    return NextResponse.json({ variants: variants || [] })
  } catch (error) {
    console.error("[v0 SERVER] Unexpected error fetching variants:", error)
    console.error("[v0 SERVER] Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0 SERVER] Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json(
      {
        error: "Failed to fetch variants",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// POST - Create a new variant
export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", params.productId)
      .single()

    if (productError || !product) {
      console.error("[v0] Error finding product:", productError)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const variantData = {
      product_id: product.id,
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
