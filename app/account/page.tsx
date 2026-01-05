import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import CustomerDashboard from "@/components/customer-dashboard"

export default async function AccountPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/account/login")
  }

  return <CustomerDashboard userEmail={user.email || ""} />
}
