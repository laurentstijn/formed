import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { ArrowLeft } from "lucide-react"
import { ProductDetailClient } from "@/components/product-detail-client"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const supabase = await createClient()

    const { data: product, error } = await supabase.from("products").select("*").eq("id", Number(id)).single()

    if (error || !product) {
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

          <ProductDetailClient product={product} productUrl={productUrl} />
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
