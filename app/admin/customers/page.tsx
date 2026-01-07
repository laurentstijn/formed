import AdminLayout from "@/components/admin-layout"
import CustomersManagement from "@/components/customers-management"
import { cookies } from "next/headers"

export default async function CustomersPage() {
  const cookieStore = await cookies()
  const adminEmail = cookieStore.get("admin_email")?.value || "admin@formed.nl"

  return (
    <AdminLayout userEmail={adminEmail}>
      <CustomersManagement />
    </AdminLayout>
  )
}
