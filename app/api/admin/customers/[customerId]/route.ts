import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  try {
    const { customerId } = await params

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: customer, error: fetchError } = await supabase
      .from("customers")
      .select("user_id")
      .eq("id", customerId)
      .single()

    if (fetchError) throw fetchError

    const { error: ordersError } = await supabase.from("orders").delete().eq("customer_id", customerId)

    if (ordersError) throw ordersError

    const { error: customerError } = await supabase.from("customers").delete().eq("id", customerId)

    if (customerError) throw customerError

    if (customer?.user_id) {
      const { error: authError } = await supabase.auth.admin.deleteUser(customer.user_id)

      if (authError) {
        console.error("Error deleting auth user:", authError)
        // Don't throw - customer and orders are already deleted
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
