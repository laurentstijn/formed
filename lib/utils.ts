import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCachedImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg?height=400&width=400"

  // Data URLs can be used directly
  if (url.startsWith("data:")) {
    return url
  }

  // Supabase Storage URLs work reliably - use directly
  if (url.includes(".supabase.co/storage/")) {
    return url
  }

  // If it's a Vercel Blob URL (legacy data), show placeholder
  // These won't work in v0 preview anyway
  if (url.includes(".blob.vercel-storage.com")) {
    console.warn("[v0] Blob URL detected (not supported in preview):", url)
    return "/placeholder.svg?height=400&width=400"
  }

  // Return other URLs as-is
  return url
}
