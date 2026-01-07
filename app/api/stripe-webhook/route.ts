import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import type Stripe from "stripe"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // In test mode, we'll skip webhook signature verification for now
    // In production, you should set STRIPE_WEBHOOK_SECRET
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } else {
      // Parse the event without verification (test mode only)
      event = JSON.parse(body)
    }
  } catch (err: any) {
    console.error("[v0] Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  console.log("[v0] Webhook event received:", event.type)

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    console.log("[v0] Payment completed for session:", session.id)
    console.log("[v0] Order ID from metadata:", session.metadata?.orderId)

    if (session.metadata?.orderId) {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", session.metadata.orderId)
        .single()

      if (orderError || !order) {
        console.error("[v0] Error fetching order:", orderError)
        return NextResponse.json({ received: true })
      }

      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          status: "processing",
        })
        .eq("id", session.metadata.orderId)

      if (error) {
        console.error("[v0] Error updating order:", error)
      } else {
        console.log("[v0] Order updated successfully to paid status")
      }

      for (const item of order.items) {
        try {
          const { data: product } = await supabase.from("products").select("stock, colors").eq("id", item.id).single()

          if (product) {
            if (item.color && product.colors) {
              // Update color-specific stock
              const updatedColors = product.colors.map((c: any) => {
                if (c.name === item.color) {
                  return { ...c, stock: Math.max(0, (c.stock || 0) - item.quantity) }
                }
                return c
              })

              await supabase.from("products").update({ colors: updatedColors }).eq("id", item.id)

              console.log(`[v0] Updated stock for product ${item.id}, color ${item.color}`)
            } else {
              // Update general stock
              const newStock = Math.max(0, product.stock - item.quantity)
              await supabase.from("products").update({ stock: newStock }).eq("id", item.id)

              console.log(`[v0] Updated general stock for product ${item.id}`)
            }
          }
        } catch (stockError) {
          console.error(`[v0] Error updating stock for product ${item.id}:`, stockError)
        }
      }

      try {
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : request.headers.get("origin") || "http://localhost:3000"

        const emailResponse = await fetch(`${baseUrl}/api/send-order-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: order,
            email: order.email,
            domain: "be",
          }),
        })

        const emailResult = await emailResponse.json()
        console.log("[v0] Email result:", emailResult)

        if (emailResult.emailsSent) {
          console.log("[v0] ✅ Order confirmation emails sent successfully")
        } else {
          console.error("[v0] ⚠️ Emails NOT sent:", emailResult.emailError)
        }
      } catch (emailError) {
        console.error("[v0] ❌ Email sending failed:", emailError)
      }
    }
  }

  return NextResponse.json({ received: true })
}
