import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const { productId, email } = await request.json()

    if (!productId || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Ongeldig e-mailadres" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const { error } = await supabase.from("stock_notifications").upsert(
      {
        product_id: productId,
        email: normalizedEmail,
        notified: false,
        notified_at: null,
      },
      { onConflict: "product_id,email" },
    )

    if (error) {
      console.error("[stock-notify] insert error:", error)
      return NextResponse.json({ error: "Inschrijven mislukt" }, { status: 500 })
    }

    const { data: product } = await supabase.from("products").select("name").eq("id", productId).single()

    resend.emails
      .send({
        from: "FORMD <info@formd.be>",
        to: "info@formd.be",
        subject: `Nieuwe inschrijving: ${product?.name || "product"}`,
        html: `
          <div style="font-family: sans-serif; color: #24261e;">
            <p><strong>${normalizedEmail}</strong> wil verwittigd worden zodra <strong>${product?.name || "een product"}</strong> terug op voorraad is.</p>
          </div>
        `,
      })
      .catch((sendError) => console.error("[stock-notify] admin notify error:", sendError))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[stock-notify] error:", error)
    return NextResponse.json({ error: "Inschrijven mislukt" }, { status: 500 })
  }
}
