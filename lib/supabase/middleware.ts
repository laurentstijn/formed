import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return supabaseResponse
  }

  const supabaseUrl =
    request.headers.get("x-supabase-url") || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

  const supabaseAnonKey =
    request.headers.get("x-supabase-anon-key") ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase credentials not available in middleware, skipping auth check")
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!request.nextUrl.pathname.startsWith("/account/login") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/account/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
