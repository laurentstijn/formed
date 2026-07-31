import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

function computeStock(product: { stock: number | null; colors: { stock?: number }[] | null }) {
  if (product.colors && product.colors.length > 0) {
    return product.colors.reduce((sum, c) => sum + (c.stock || 0), 0)
  }
  return product.stock || 0
}

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()
    if (!productId) {
      return NextResponse.json({ error: "productId is verplicht" }, { status: 400 })
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, stock, colors")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Product niet gevonden" }, { status: 404 })
    }

    if (computeStock(product) <= 0) {
      return NextResponse.json({ sent: 0, reason: "Nog niet op voorraad" })
    }

    const { data: subscribers, error: subError } = await supabase
      .from("stock_notifications")
      .select("id, email")
      .eq("product_id", productId)
      .eq("notified", false)

    if (subError) {
      console.error("[notify-back-in-stock] fetch subscribers error:", subError)
      return NextResponse.json({ error: "Kon abonnees niet ophalen" }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    const productUrl = `https://formd.be/product/${product.id}`
    let sent = 0

    for (const subscriber of subscribers) {
      try {
        await resend.emails.send({
          from: "FORMD <info@formd.be>",
          replyTo: "info@formd.be",
          to: subscriber.email,
          subject: `${product.name} is terug op voorraad`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #24261e;">
              <h1 style="font-size: 20px;">Goed nieuws!</h1>
              <p><strong>${product.name}</strong> is terug op voorraad bij FORMD.</p>
              <p>
                <a href="${productUrl}" style="display: inline-block; background: #4b5d45; color: #f3f5ee; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                  Bekijk product
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #dcded0; margin: 28px 0 16px;" />
              <p style="font-size: 12px; color: #6e7062; line-height: 1.6;">
                FORMD — metalen woonaccessoires &amp; laser op maat, Antwerpen<br />
                <a href="https://formd.be" style="color: #6e7062;">formd.be</a> ·
                <a href="mailto:info@formd.be" style="color: #6e7062;">info@formd.be</a><br />
                Je ontvangt deze mail eenmalig omdat je je aanmeldde voor een herbevoorradings-melding op formd.be.
              </p>
            </div>
          `,
        })

        await supabase
          .from("stock_notifications")
          .update({ notified: true, notified_at: new Date().toISOString() })
          .eq("id", subscriber.id)

        sent += 1
      } catch (sendError) {
        console.error("[notify-back-in-stock] send error for", subscriber.email, sendError)
      }
    }

    return NextResponse.json({ sent })
  } catch (error) {
    console.error("[notify-back-in-stock] error:", error)
    return NextResponse.json({ error: "Versturen mislukt" }, { status: 500 })
  }
}
