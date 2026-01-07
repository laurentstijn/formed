import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()

    console.log("[v0] Server: Creating order:", orderData)
    console.log("[v0] Server: Order items:", JSON.stringify(orderData.items, null, 2))

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

    const FREE_SHIPPING_THRESHOLD = 75.0
    const SHIPPING_COST = 7.5

    // Calculate subtotal from items
    const subtotal = orderData.items.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity
    }, 0)

    // Apply free shipping threshold
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const correctedTotalAmount = subtotal + shippingCost

    console.log("[v0] Server: Pricing breakdown:", {
      subtotal,
      shippingCost,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      originalTotal: orderData.total_amount,
      correctedTotal: correctedTotalAmount,
    })

    let finalCustomerId = orderData.customer_id

    if (!finalCustomerId) {
      // Guest checkout or account created during checkout - check if customer with this email already exists
      console.log("[v0] Server: Checking for existing customer by email:", orderData.email)

      const customerCheckResponse = await fetch(
        `${supabaseUrl}/rest/v1/customers?email=eq.${encodeURIComponent(orderData.email)}`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        },
      )

      const existingCustomers = await customerCheckResponse.json()

      if (existingCustomers && existingCustomers.length > 0) {
        // Update existing customer with latest info and auth link if provided
        finalCustomerId = existingCustomers[0].id
        console.log("[v0] Server: Found existing customer:", finalCustomerId)

        const updatePayload: any = {
          first_name: orderData.first_name,
          last_name: orderData.last_name,
          phone: orderData.phone,
          address_line1: orderData.address_line1,
          address_line2: orderData.address_line2,
          city: orderData.city,
          postal_code: orderData.postal_code,
          country: orderData.country,
        }

        if (orderData.auth_user_id) {
          updatePayload.user_id = orderData.auth_user_id
          console.log("[v0] Server: Linking auth user to existing customer:", orderData.auth_user_id)
        }

        await fetch(`${supabaseUrl}/rest/v1/customers?id=eq.${finalCustomerId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify(updatePayload),
        })

        console.log("[v0] Server: Updated existing customer with latest info, address, and auth link")
      } else {
        // Create new customer
        console.log("[v0] Server: Creating new customer:", orderData.email)

        const newCustomerPayload: any = {
          email: orderData.email,
          first_name: orderData.first_name,
          last_name: orderData.last_name,
          phone: orderData.phone,
          address_line1: orderData.address_line1,
          address_line2: orderData.address_line2,
          city: orderData.city,
          postal_code: orderData.postal_code,
          country: orderData.country,
        }

        if (orderData.auth_user_id) {
          newCustomerPayload.user_id = orderData.auth_user_id
          console.log("[v0] Server: Creating customer with auth link:", orderData.auth_user_id)
        }

        const createCustomerResponse = await fetch(`${supabaseUrl}/rest/v1/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify(newCustomerPayload),
        })

        const newCustomer = await createCustomerResponse.json()
        finalCustomerId = newCustomer[0]?.id || newCustomer.id
        console.log("[v0] Server: Created new customer:", finalCustomerId)
      }
    } else {
      const customerCheckResponse = await fetch(`${supabaseUrl}/rest/v1/customers?id=eq.${orderData.customer_id}`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      })

      const existingCustomers = await customerCheckResponse.json()

      if (!existingCustomers || existingCustomers.length === 0) {
        console.log("[v0] Server: Creating customer record for logged-in user with auth link:", orderData.customer_id)

        await fetch(`${supabaseUrl}/rest/v1/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            id: orderData.customer_id,
            user_id: orderData.customer_id, // Link to Supabase Auth user
            email: orderData.email,
            first_name: orderData.first_name,
            last_name: orderData.last_name,
            phone: orderData.phone,
            address_line1: orderData.address_line1,
            address_line2: orderData.address_line2,
            city: orderData.city,
            postal_code: orderData.postal_code,
            country: orderData.country,
          }),
        })

        console.log("[v0] Server: Customer record created successfully with auth link and address")
      } else {
        console.log("[v0] Server: Updating existing customer with auth link and latest info")

        await fetch(`${supabaseUrl}/rest/v1/customers?id=eq.${orderData.customer_id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            user_id: orderData.customer_id, // Link to Supabase Auth user
            first_name: orderData.first_name,
            last_name: orderData.last_name,
            phone: orderData.phone,
            address_line1: orderData.address_line1,
            address_line2: orderData.address_line2,
            city: orderData.city,
            postal_code: orderData.postal_code,
            country: orderData.country,
          }),
        })

        console.log("[v0] Server: Updated customer with auth link and address")
      }
    }

    for (const item of orderData.items) {
      console.log(`[v0] Server: Checking stock for item:`, {
        id: item.id,
        name: item.name,
        color: item.color,
        quantity: item.quantity,
      })

      const productResponse = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${item.id}&select=stock,colors`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      })

      const products = await productResponse.json()
      const product = products[0]

      console.log(`[v0] Server: Product data for ${item.name}:`, {
        hasColors: !!product?.colors,
        colors: product?.colors,
        generalStock: product?.stock,
      })

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: `Product "${item.name}" niet gevonden.`,
          },
          { status: 404 },
        )
      }

      if (item.color && product.colors) {
        const selectedColorData = product.colors.find((c: any) => c.name === item.color)
        console.log(`[v0] Server: Color check for "${item.color}":`, {
          found: !!selectedColorData,
          colorData: selectedColorData,
        })

        if (!selectedColorData || !selectedColorData.stock || selectedColorData.stock < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              error: `Product "${item.name}" in kleur "${item.color}" is niet meer op voorraad of er is onvoldoende voorraad beschikbaar.`,
            },
            { status: 400 },
          )
        }
      } else if (product.stock < item.quantity) {
        console.log(`[v0] Server: Fallback stock check failed:`, {
          productStock: product.stock,
          requestedQuantity: item.quantity,
        })
        // Fallback to general stock check
        return NextResponse.json(
          {
            success: false,
            error: `Product "${item.name}" is niet meer op voorraad of er is onvoldoende voorraad beschikbaar.`,
          },
          { status: 400 },
        )
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
      customer_id: finalCustomerId, // Always link to customer
      items: orderData.items,
      total_amount: correctedTotalAmount,
      shipping_cost: shippingCost,
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
      try {
        const stockResponse = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${item.id}&select=stock,colors`, {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        })

        const products = await stockResponse.json()
        const product = products[0]

        if (item.color && product.colors) {
          // Update color-specific stock
          const updatedColors = product.colors.map((c: any) => {
            if (c.name === item.color) {
              return { ...c, stock: Math.max(0, (c.stock || 0) - item.quantity) }
            }
            return c
          })

          await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${item.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({ colors: updatedColors }),
          })

          console.log(`[v0] Server: Updated stock for product ${item.id}, color ${item.color}`)
        } else {
          // Update general stock
          const currentStock = product.stock || 0
          const newStock = Math.max(0, currentStock - item.quantity)

          await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${item.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({ stock: newStock }),
          })

          console.log(`[v0] Server: Updated general stock for product ${item.id}`)
        }
      } catch (stockError) {
        console.error(`[v0] CRITICAL: Stock update error for product ${item.id}:`, stockError)
      }
    }

    try {
      console.log("[v0] Server: Attempting to send order emails...")
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : request.headers.get("origin") || "http://localhost:3000"

      console.log("[v0] Server: Email API URL:", `${baseUrl}/api/send-order-email`)

      const emailResponse = await fetch(`${baseUrl}/api/send-order-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: createdOrder[0] || createdOrder,
          email: orderData.email,
          domain: orderData.domain || "be",
        }),
      })

      const emailResult = await emailResponse.json()
      console.log("[v0] Server: Email API response:", emailResult)

      if (!emailResult.emailsSent) {
        console.error("[v0] Server: ⚠️ Emails NOT sent:", emailResult.emailError || emailResult.message)
      } else {
        console.log("[v0] Server: ✅ Order confirmation emails sent successfully")
      }
    } catch (emailError) {
      console.error("[v0] Server: ❌ Email sending FAILED:", emailError)
      console.error("[v0] Server: Email error details:", {
        message: emailError instanceof Error ? emailError.message : String(emailError),
        stack: emailError instanceof Error ? emailError.stack : undefined,
      })
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
