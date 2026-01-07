import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"

export async function getAdminEmail(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const adminEmail = cookieStore.get("admin_email")?.value

    console.log("[v0] Admin auth check - cookie value:", adminEmail)

    if (!adminEmail) {
      console.log("[v0] No admin cookie found")
      return null
    }

    // Verify the email still exists in admins table
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("admins").select("email").eq("email", adminEmail).single()

    console.log("[v0] Admin verification - data:", data, "error:", error)

    if (error || !data) {
      console.log("[v0] Admin not found in database")
      return null
    }

    console.log("[v0] Admin verified successfully:", adminEmail)
    return adminEmail
  } catch (error) {
    console.error("[v0] Get admin email error:", error)
    return null
  }
}

export async function requireAdmin(): Promise<string> {
  const email = await getAdminEmail()
  if (!email) {
    throw new Error("Not authorized")
  }
  return email
}
