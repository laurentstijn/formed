import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function PATCH(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const productId = params.productId

    // Get current status
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("is_active")
      .eq("id", productId)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Toggle the status
    const { error: updateError } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", productId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error toggling product:", error)
    return NextResponse.json({ error: "Failed to toggle product status" }, { status: 500 })
  }
}
