import AdminLayout from "@/components/admin-layout"
import { StatisticsDashboard } from "@/components/statistics-dashboard"
import { cookies } from "next/headers"

export default async function StatisticsPage() {
  const cookieStore = await cookies()
  const adminEmail = cookieStore.get("admin_email")?.value || "admin@formed.nl"

  return (
    <AdminLayout userEmail={adminEmail}>
      <StatisticsDashboard />
    </AdminLayout>
  )
}
