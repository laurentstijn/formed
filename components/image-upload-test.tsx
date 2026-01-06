"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function ImageUploadTest() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    url?: string
    error?: string
    accessible?: boolean
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const testUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      console.log("[v0] TEST: Uploading file:", file.name)

      // Upload to Supabase via API
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Upload failed")
      }

      console.log("[v0] TEST: Upload successful, URL:", uploadData.url)

      // Test if image is accessible by trying to load it
      console.log("[v0] TEST: Testing if image is accessible...")

      const imageAccessible = await new Promise<boolean>((resolve) => {
        const img = new Image()
        img.onload = () => {
          console.log("[v0] TEST: Image loaded successfully!")
          resolve(true)
        }
        img.onerror = () => {
          console.log("[v0] TEST: Image failed to load")
          resolve(false)
        }
        img.src = uploadData.url
        // Timeout after 10 seconds
        setTimeout(() => {
          console.log("[v0] TEST: Image load timeout")
          resolve(false)
        }, 10000)
      })

      setResult({
        success: true,
        url: uploadData.url,
        accessible: imageAccessible,
      })
    } catch (error) {
      console.error("[v0] TEST: Error:", error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Storage Upload Test</CardTitle>
        <CardDescription>Test of afbeeldingen correct worden geüpload en toegankelijk zijn</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
          <Button onClick={testUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Test Upload
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-semibold">{result.success ? "Upload Succesvol" : "Upload Gefaald"}</span>
            </div>

            {result.url && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium">URL:</p>
                  <p className="break-all text-sm text-muted-foreground">{result.url}</p>
                </div>

                <div className="flex items-center gap-2">
                  {result.accessible ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Afbeelding is toegankelijk ✓</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Afbeelding NIET toegankelijk ✗</span>
                    </>
                  )}
                </div>

                {result.accessible && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Preview:</p>
                    <img
                      src={result.url || "/placeholder.svg"}
                      alt="Uploaded test"
                      className="max-h-48 rounded border object-contain"
                    />
                  </div>
                )}
              </>
            )}

            {result.error && (
              <div className="rounded bg-red-50 p-3">
                <p className="text-sm text-red-600">Error: {result.error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
