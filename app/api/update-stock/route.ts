import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json()

    console.log("[v0] Updating stock for product:", productId, "quantity:", quantity)

    // Get current stock
    const getResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?id=eq.${productId}&select=stock`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      },
    )

    const products = await getResponse.json()

    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const currentStock = products[0].stock || 0
    const newStock = Math.max(0, currentStock - quantity)

    console.log("[v0] Current stock:", currentStock, "New stock:", newStock)

    // Update stock
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({ stock: newStock }),
    })

    if (!updateResponse.ok) {
      throw new Error("Failed to update stock")
    }

    return NextResponse.json({ success: true, newStock })
  } catch (error) {
    console.error("[v0] Error updating stock:", error)
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 })
  }
}
