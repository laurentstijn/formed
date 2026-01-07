import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import type Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Creating checkout session...")

    const body = await request.json()
    const { items, customerEmail, customerName, shippingCost, orderId } = body

    console.log("[v0] Order ID:", orderId)
    console.log("[v0] Customer:", customerName, customerEmail)
    console.log("[v0] Items:", items.length)

    // Calculate line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `${item.name}${item.color ? ` - ${item.color}` : ""}`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    // Add shipping as line item if present
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Verzendkosten",
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      })
    }

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : request.headers.get("origin") || "http://localhost:3000"

    const stripeKey = process.env.STRIPE_SECRET_KEY || ""
    console.log("[v0] Using Stripe key starting with:", stripeKey.substring(0, 20))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "bancontact"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        orderId,
        customerName,
      },
      custom_text: {
        submit: {
          message: "Veilig betalen via Stripe",
        },
      },
      payment_intent_data: {
        description: `Bestelling #${orderId.substring(0, 8)}`,
      },
      locale: "nl",
      billing_address_collection: "auto",
    })

    console.log("[v0] ✅ Checkout session created:", session.id)

    const supabase = await createClient()
    const { error: updateError } = await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId)

    if (updateError) {
      console.error("[v0] Error updating order with session ID:", updateError)
    } else {
      console.log("[v0] Order updated with session ID")
    }

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error("[v0] ❌ Error creating checkout session:", error)
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 })
  }
}
