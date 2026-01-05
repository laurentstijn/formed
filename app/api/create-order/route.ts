import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()

    console.log("[v0] Server: Creating order:", orderData)

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

    for (const item of orderData.items) {
      const productResponse = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${item.id}&select=stock`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      })

      const products = await productResponse.json()
      const product = products[0]

      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Product "${item.name}" is niet meer op voorraad of er is onvoldoende voorraad beschikbaar.`,
          },
          { status: 400 },
        )
      }
    }

    if (orderData.customer_id) {
      // Check if customer exists
      const customerCheckResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/customers?id=eq.${orderData.customer_id}`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        },
      )

      const existingCustomers = await customerCheckResponse.json()

      // If customer doesn't exist, create one
      if (!existingCustomers || existingCustomers.length === 0) {
        console.log("[v0] Server: Creating customer record for user:", orderData.customer_id)

        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            id: orderData.customer_id,
            email: orderData.email,
            first_name: orderData.first_name,
            last_name: orderData.last_name,
            phone: orderData.phone,
          }),
        })

        console.log("[v0] Server: Customer record created successfully")
      }
    }

    const orderPayload = {
      email: orderData.email,
      first_name: orderData.first_name,
      last_name: orderData.last_name,
      phone: orderData.phone,
      address_line1: orderData.address_line1,
      city: orderData.city,
      postal_code: orderData.postal_code,
      country: orderData.country,
      customer_id: orderData.customer_id || null,
      items: orderData.items,
      total_amount: orderData.total_amount,
      status: "pending",
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(orderPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Server: Failed to create order:", response.status, errorText)
      throw new Error(`Failed to create order: ${errorText}`)
    }

    const createdOrder = await response.json()
    console.log("[v0] Server: Order created successfully:", createdOrder)

    for (const item of orderData.items) {
      // Fetch current stock
      const stockResponse = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${item.id}&select=stock`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      })

      const products = await stockResponse.json()
      const currentStock = products[0]?.stock || 0
      const newStock = Math.max(0, currentStock - item.quantity)

      // Update stock
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ stock: newStock }),
      })

      if (!updateResponse.ok) {
        console.error("[v0] Server: Failed to decrease stock for product:", item.id)
      } else {
        console.log(`[v0] Server: Stock decreased for ${item.name}: ${currentStock} -> ${newStock}`)
      }
    }

    try {
      await fetch(`${request.headers.get("origin")}/api/send-order-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: createdOrder[0] || createdOrder,
          domain: orderData.domain || "be",
        }),
      })
    } catch (emailError) {
      console.error("[v0] Server: Failed to send emails:", emailError)
    }

    return NextResponse.json({ success: true, order: createdOrder[0] || createdOrder })
  } catch (error) {
    console.error("[v0] Server: Error creating order:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
