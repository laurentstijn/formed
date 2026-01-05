"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Package, Users, ShoppingCart, Menu, X, Settings } from "lucide-react"
import SiteHeader from "@/components/site-header"

interface AdminLayoutProps {
  children: React.ReactNode
  userEmail: string
}

export function AdminLayout({ children, userEmail }: AdminLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [orderCount, setOrderCount] = useState<number>(0)

  useEffect(() => {
    console.log("[v0] Fetching order count...")
    fetch("/api/admin/orders")
      .then((res) => {
        console.log("[v0] Order count response status:", res.status)
        return res.json()
      })
      .then((data) => {
        console.log("[v0] Order count data:", data)
        const activeOrders = data.orders.filter(
          (order: any) => order.status === "pending" || order.status === "processing",
        )
        setOrderCount(activeOrders.length)
      })
      .catch((err) => {
        console.error("[v0] Failed to fetch order count:", err)
        setOrderCount(0)
      })
  }, [])

  const navigation = [
    { name: "Producten", href: "/admin", icon: Package },
    { name: "Klanten", href: "/admin/customers", icon: Users },
    { name: "Bestellingen", href: "/admin/orders", icon: ShoppingCart, count: orderCount },
    { name: "Instellingen", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <div className="flex flex-1">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-20 left-4 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Sidebar */}
        <aside
          className={`${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static top-16 inset-y-0 left-0 z-40 w-64 bg-card border-r transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.count !== undefined && (
                      <span
                        className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${
                          isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 pt-20 lg:pt-8">{children}</div>
        </main>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden top-16" onClick={() => setIsMobileMenuOpen(false)} />
        )}
      </div>
    </div>
  )
}

export default AdminLayout
