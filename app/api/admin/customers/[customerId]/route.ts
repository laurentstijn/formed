import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  try {
    const { customerId } = await params
    const body = await request.json()
    const { first_name, last_name } = body

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data, error } = await supabase
      .from("customers")
      .update({
        first_name,
        last_name,
      })
      .eq("id", customerId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

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
      console.log("[v0] Attempting to delete auth user:", customer.user_id)
      const { error: authError } = await supabase.auth.admin.deleteUser(customer.user_id)

      if (authError) {
        console.error("[v0] Error deleting auth user:", authError)
        // Return error so admin knows auth deletion failed
        return NextResponse.json(
          {
            success: true,
            warning:
              "Customer verwijderd maar auth user kon niet worden verwijderd. Dit moet handmatig worden gedaan in Supabase Auth.",
          },
          { status: 200 },
        )
      }
      console.log("[v0] Successfully deleted auth user:", customer.user_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
