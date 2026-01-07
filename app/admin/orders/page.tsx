import AdminLayout from "@/components/admin-layout"
import OrdersManagement from "@/components/orders-management"
import { cookies } from "next/headers"

export default async function OrdersPage() {
  const cookieStore = await cookies()
  const adminEmail = cookieStore.get("admin_email")?.value || "admin@formed.nl"

  return (
    <AdminLayout userEmail={adminEmail}>
      <OrdersManagement />
    </AdminLayout>
  )
}
