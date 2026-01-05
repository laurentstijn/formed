import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Use service role key to bypass RLS
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("[v0] Error fetching orders:", ordersError)
      return NextResponse.json({ error: ordersError.message }, { status: 500 })
    }

    const ordersWithItems =
      orders?.map((order) => ({
        ...order,
        order_items: order.items || [], // items is already a JSONB array
      })) || []

    return NextResponse.json({ orders: ordersWithItems })
  } catch (error: any) {
    console.error("[v0] Error in admin orders API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { orderId, status, tracking_number, tracking_url } = await request.json()

    // Use service role key to bypass RLS
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const updateData: any = { status }
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number
    if (tracking_url !== undefined) updateData.tracking_url = tracking_url

    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId)

    if (error) {
      console.error("[v0] Error updating order:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (status === "shipped") {
      const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single()

      if (order) {
        try {
          // Use relative URL for internal API call
          const response = await fetch(new URL("/api/send-shipping-email", request.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order,
              email: order.email,
              domain: order.domain || "nl",
              tracking_number: order.tracking_number,
              tracking_url: order.tracking_url,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error("[v0] Error sending shipping email:", errorData)
          } else {
            console.log("[v0] Shipping email sent successfully")
          }
        } catch (err) {
          console.error("[v0] Error sending shipping email:", err)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in admin orders update API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
