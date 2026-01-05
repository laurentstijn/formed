import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const subtotal = Number.parseFloat(searchParams.get("subtotal") || "0")

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: settings, error } = await supabase
    .from("invoice_settings")
    .select("shipping_cost, free_shipping_threshold, shipping_description")
    .single()

  const SHIPPING_COST = settings?.shipping_cost ?? 7.5
  const FREE_SHIPPING_THRESHOLD = settings?.free_shipping_threshold ?? 75.0
  const DESCRIPTION = settings?.shipping_description ?? "Levering binnen 3-5 werkdagen"

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const isFreeShipping = shippingCost === 0

  return NextResponse.json({
    shippingCost,
    isFreeShipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    description: DESCRIPTION,
  })
}
