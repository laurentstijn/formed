import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// PUT - Update a variant
export async function PUT(request: NextRequest, { params }: { params: { productId: string; variantId: string } }) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.price !== undefined) updateData.price = body.price
    if (body.stock !== undefined) updateData.stock = body.stock
    if (body.sku !== undefined) updateData.sku = body.sku
    if (body.colors !== undefined) updateData.colors = body.colors
    if (body.gallery_images !== undefined) updateData.gallery_images = body.gallery_images
    if (body.technical_drawing !== undefined) updateData.technical_drawing = body.technical_drawing
    if (body.is_active !== undefined) updateData.is_active = body.is_active

    updateData.updated_at = new Date().toISOString()

    const { data: variant, error } = await supabase
      .from("product_variants")
      .update(updateData)
      .eq("id", params.variantId)
      .eq("product_id", params.productId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating variant:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ variant })
  } catch (error) {
    console.error("[v0] Unexpected error updating variant:", error)
    return NextResponse.json({ error: "Failed to update variant" }, { status: 500 })
  }
}

// DELETE - Delete a variant
export async function DELETE(request: NextRequest, { params }: { params: { productId: string; variantId: string } }) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", params.variantId)
      .eq("product_id", params.productId)

    if (error) {
      console.error("[v0] Error deleting variant:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Unexpected error deleting variant:", error)
    return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 })
  }
}
