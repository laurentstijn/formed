import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase credentials:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      env: process.env,
    })
    throw new Error("Missing Supabase URL or Anon Key")
  }

  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function createClient() {
  return createBrowserClient()
}
