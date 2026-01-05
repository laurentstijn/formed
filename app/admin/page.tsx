import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import AdminLayout from "@/components/admin-layout"
import ProductsManagement from "@/components/products-management"

export default async function AdminPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  if (!token) {
    redirect("/admin/login")
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/admins?id=eq.${user.id}&select=*`, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  const adminData = await response.json()

  if (!adminData || adminData.length === 0 || adminData.code) {
    redirect("/")
  }
  // </CHANGE>

  return (
    <AdminLayout userEmail={user.email || ""}>
      <ProductsManagement />
    </AdminLayout>
  )
}
