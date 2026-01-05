import { type NextRequest, NextResponse } from "next/server"

const imageCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>()
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter required" }, { status: 400 })
    }

    console.log("[v0] Image cache requested for:", url)

    // Check cache first
    const cached = imageCache.get(url)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("[v0] Returning cached image")
      return new NextResponse(cached.data, {
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=3600",
        },
      })
    }

    // Fetch from Vercel Blob
    console.log("[v0] Fetching from Blob storage...")
    const response = await fetch(url)

    if (!response.ok) {
      console.error("[v0] Blob fetch failed:", response.status, response.statusText)
      // Return placeholder on error
      return NextResponse.redirect(new URL("/placeholder.svg?height=400&width=400", request.url))
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = response.headers.get("content-type") || "image/png"

    // Cache the image
    imageCache.set(url, {
      data: buffer,
      contentType,
      timestamp: Date.now(),
    })

    console.log("[v0] Image cached successfully")

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("[v0] Image cache error:", error)
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
  }
}
