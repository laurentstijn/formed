import AdminLayout from "@/components/admin-layout"
import UsersManagement from "@/components/users-management"
import { cookies } from "next/headers"

export default async function UsersPage() {
  const cookieStore = await cookies()
  const adminEmail = cookieStore.get("admin_email")?.value || "admin@formed.nl"

  return (
    <AdminLayout userEmail={adminEmail}>
      <UsersManagement />
    </AdminLayout>
  )
}
