import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

function parseProductId(productId: string): number | null {
  // Try to parse as number directly
  const numId = Number(productId)
  if (!isNaN(numId) && isFinite(numId)) {
    return numId
  }

  // If it's a UUID, we need to fetch the actual numeric ID from products table
  // For now, return null to indicate invalid format
  return null
}

// GET - Fetch all variants for a product
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    console.log("[v0] Fetching variants for product:", params.productId)

    const supabase = await createServerClient()

    let numericProductId: number | null = parseProductId(params.productId)

    if (numericProductId === null) {
      // It might be a UUID, so fetch the numeric ID from products table
      const { data: product } = await supabase.from("products").select("id").eq("id", params.productId).single()

      if (product) {
        numericProductId = Number(product.id)
      }
    }

    if (numericProductId === null) {
      console.error("[v0] Invalid product ID format:", params.productId)
      return NextResponse.json({ variants: [] })
    }

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", numericProductId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching variants:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Fetched variants:", variants)
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
