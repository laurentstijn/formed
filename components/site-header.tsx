"use client"

import Link from "next/link"
import { CartButton } from "@/components/cart-button"
import { User, Settings, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function SiteHeader() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const checkAdminResponse = await fetch("/api/admin/check")
      if (checkAdminResponse.ok) {
        const { isAdmin: adminStatus, email } = await checkAdminResponse.json()
        if (adminStatus) {
          setIsAdmin(true)
          setIsLoggedIn(true)
          setUserName(email.split("@")[0])
          return
        }
      }

      // Check regular Supabase Auth
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setIsLoggedIn(true)

        const { data: customerData } = await supabase
          .from("customers")
          .select("first_name, last_name")
          .eq("id", user.id)
          .maybeSingle()

        if (customerData?.first_name) {
          setUserName(customerData.first_name)
        } else {
          const emailName = user.email?.split("@")[0] || "Account"
          setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
        }

        const cachedAdminStatus = localStorage.getItem("isAdmin")
        if (cachedAdminStatus === "true") {
          setIsAdmin(true)
        } else if (cachedAdminStatus === "false") {
          setIsAdmin(false)
        } else {
          const { data: adminData } = await supabase.from("admins").select("*").eq("id", user.id).single()
          const adminStatus = !!adminData
          setIsAdmin(adminStatus)
          localStorage.setItem("isAdmin", adminStatus ? "true" : "false")
        }
      } else {
        setIsLoggedIn(false)
        setIsAdmin(false)
        setUserName("")
        localStorage.removeItem("isAdmin")
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    if (isAdmin) {
      await fetch("/api/admin/logout", { method: "POST" })
    }

    const supabase = createClient()
    await supabase.auth.signOut()

    localStorage.removeItem("isAdmin")
    setIsLoggedIn(false)
    setIsAdmin(false)
    setUserName("")
    setMobileMenuOpen(false)

    window.location.href = "/"
  }

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/formd-primary.png" alt="FORMD" className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Shop
          </Link>
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Over Ons
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/account"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                {userName}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Uitloggen
              </button>
            </>
          ) : (
            <Link
              href="/account/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Inloggen
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <CartButton />
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Over Ons
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/account"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {userName}
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left py-2"
                >
                  Uitloggen
                </button>
              </>
            ) : (
              <Link
                href="/account/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Inloggen
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

export default SiteHeader
