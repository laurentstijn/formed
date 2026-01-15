import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch all variants for a product
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const supabase = await createServerClient()

    console.log("[v0] Fetching variants for product:", params.productId)

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", params.productId)
      .single()

    if (productError || !product) {
      console.error("[v0] Error finding product:", productError)
      return NextResponse.json({ variants: [] })
    }

    console.log("[v0] Found product with ID:", product.id)

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching variants:", error)
      console.error("[v0] Error details:", JSON.stringify(error))
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

    console.log("[v0] Found variants:", variants?.length || 0)
    return NextResponse.json({ variants: variants || [] })
  } catch (error) {
    console.error("[v0] Unexpected error fetching variants:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack")
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
