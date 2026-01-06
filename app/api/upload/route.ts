import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] ===== UPLOAD API CALLED =====")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File:", file.name, file.size, "bytes", file.type)

    const blob = new Blob([await file.arrayBuffer()], { type: file.type })

    // Create Supabase client
    const supabase = await createClient()

    const timestamp = Date.now()
    const filePath = `products/${timestamp}-${file.name}`

    console.log("[v0] Uploading to Supabase Storage:", filePath)

    const { data, error } = await supabase.storage.from("product-images").upload(filePath, blob, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("[v0] Supabase upload error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(data.path)

    console.log("[v0] Upload successful! Public URL:", urlData.publicUrl)

    return NextResponse.json({
      url: urlData.publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Upload failed:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
