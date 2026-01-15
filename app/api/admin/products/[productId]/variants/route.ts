import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Helper function to get numeric product ID from UUID or numeric string
async function getNumericProductId(supabase: any, productIdParam: string): Promise<number | null> {
  console.log("[v0] getNumericProductId input:", productIdParam)

  // If it's already a valid number, use it directly
  const numericId = Number(productIdParam)
  if (!isNaN(numericId) && numericId > 0) {
    console.log("[v0] Using numeric ID directly:", numericId)
    return numericId
  }

  // Otherwise, it's a UUID - look up the numeric id
  const { data: product, error } = await supabase.from("products").select("id").eq("id", productIdParam).single()

  if (error || !product) {
    console.error("[v0] Error finding product:", error)
    return null
  }

  const productId = Number(product.id)
  console.log("[v0] Looked up numeric product id:", productId)
  return productId
}

// GET - Fetch all variants for a product
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const supabase = await createServerClient()

    console.log("[v0] Fetching variants for product:", params.productId)

    // Check if we have a valid Supabase client
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    console.log("[v0] Auth status - User:", user?.email || "none", "Error:", authError?.message || "none")

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", params.productId)
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
