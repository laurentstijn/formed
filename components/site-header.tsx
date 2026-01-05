"use client"

import Link from "next/link"
import { CartButton } from "@/components/cart-button"
import { User, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function SiteHeader() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
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
          // Fallback to email username if no name found
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
    const supabase = createClient()
    await supabase.auth.signOut()

    localStorage.removeItem("isAdmin")
    setIsLoggedIn(false)
    setIsAdmin(false)
    setUserName("")

    window.location.href = "/"
  }

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/formd-primary.png" alt="FORMD" className="h-8 w-auto" />
        </Link>
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
        <CartButton />
      </div>
    </header>
  )
}

export default SiteHeader
