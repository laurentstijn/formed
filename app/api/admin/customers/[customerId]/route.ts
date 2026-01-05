import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function DELETE(request: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    const { customerId } = params

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { error: ordersError } = await supabase.from("orders").delete().eq("customer_id", customerId)

    if (ordersError) throw ordersError

    const { error: customerError } = await supabase.from("customers").delete().eq("id", customerId)

    if (customerError) throw customerError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
