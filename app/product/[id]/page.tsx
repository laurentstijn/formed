import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { ArrowLeft } from "lucide-react"
import { ProductDetailClient } from "@/components/product-detail-client"
import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/supabase/products"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const supabase = await createClient()

    const { data: rawProduct, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error || !rawProduct) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-sans font-semibold mb-4">Product niet gevonden</h1>
            <Link href="/" className="text-primary hover:underline">
              Terug naar shop
            </Link>
          </div>
        </div>
      )
    }

    if (rawProduct.name.toLowerCase().includes("eigen ontwerp")) {
      redirect("/eigen-ontwerp")
    }

    const { data: variantsData } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .eq("is_active", true)

    const product: Product = {
      id: rawProduct.id,
      name: rawProduct.name,
      description: rawProduct.description,
      price: rawProduct.price,
      image: rawProduct.image_url || rawProduct.image,
      category: rawProduct.category,
      stock: rawProduct.stock,
      colors: rawProduct.colors || [],
      features: rawProduct.features || [],
      technical_drawing: rawProduct.technical_drawing_url || rawProduct.technical_drawing,
      gallery_images: rawProduct.gallery_images || [],
      dimensions: rawProduct.dimensions,
      materials: rawProduct.materials,
      created_at: rawProduct.created_at,
      variants: variantsData || [], // Use variants from database
    }

    console.log("[v0] Server - Mapped product:", {
      name: product.name,
      image: product.image,
      gallery_images: product.gallery_images,
      variantsCount: product.variants?.length || 0,
    })

    const productUrl = `https://formd.be/product/${product.id}`

    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />

        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar Shop
            </Link>
          </div>

          <ProductDetailClient product={product} productUrl={productUrl} variants={product.variants || []} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading product:", error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-sans font-semibold mb-4">Product niet gevonden</h1>
          <Link href="/" className="text-primary hover:underline">
            Terug naar shop
          </Link>
        </div>
      </div>
    )
  }
}
