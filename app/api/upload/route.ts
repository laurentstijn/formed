import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] ===== UPLOAD API CALLED =====")

    // Parse the file from the request
    let file: File
    const contentType = request.headers.get("content-type")

    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData()
      file = formData.get("file") as File
    } else {
      const filename = request.nextUrl.searchParams.get("filename") || "upload"
      const blob = await request.blob()
      const mimeType = request.headers.get("content-type") || "image/png"

      let finalFilename = filename
      if (!filename.includes(".")) {
        const extension = mimeType.split("/")[1] || "png"
        finalFilename = `${filename}.${extension}`
      }

      file = new File([blob], finalFilename, { type: mimeType })
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File:", file.name, file.size, "bytes")

    // Create Supabase client
    const supabase = await createClient()

    // Create unique file path
    const timestamp = Date.now()
    const filePath = `products/${timestamp}-${file.name}`

    console.log("[v0] Uploading to Supabase Storage:", filePath)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("product-images").upload(filePath, file, {
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
