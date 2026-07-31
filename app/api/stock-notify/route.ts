import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const { productId, email } = await request.json()

    if (!productId || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Ongeldig e-mailadres" }, { status: 400 })
    }

    const { error } = await supabase.from("stock_notifications").upsert(
      {
        product_id: productId,
        email: email.trim().toLowerCase(),
        notified: false,
        notified_at: null,
      },
      { onConflict: "product_id,email" },
    )

    if (error) {
      console.error("[stock-notify] insert error:", error)
      return NextResponse.json({ error: "Inschrijven mislukt" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[stock-notify] error:", error)
    return NextResponse.json({ error: "Inschrijven mislukt" }, { status: 500 })
  }
}
