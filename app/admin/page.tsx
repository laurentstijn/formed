"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import ProductsManagement from "@/components/products-management"

export default function AdminPage() {
  const router = useRouter()
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/admin/check", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setAdminEmail(data.email)
          setLoading(false)
        } else {
          router.replace("/admin/login")
        }
      } catch (error) {
        console.error("[v0] Admin check failed:", error)
        router.replace("/admin/login")
      }
    }

    checkAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout userEmail={adminEmail || "admin@formed.nl"}>
      <div className="space-y-6">
        <ProductsManagement />
      </div>
    </AdminLayout>
  )
}
