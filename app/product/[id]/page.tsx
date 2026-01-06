import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { ArrowLeft } from "lucide-react"
import { ProductDetailClient } from "@/components/product-detail-client"

export async function generateStaticParams() {
  const { sql } = await import("@vercel/postgres")

  try {
    const { rows } = await sql`
      SELECT id FROM products WHERE is_active = true
    `
    return rows.map((row) => ({
      id: row.id.toString(),
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { sql } = await import("@vercel/postgres")

  let product = null

  try {
    const { rows } = await sql`
      SELECT * FROM products WHERE id = ${Number(id)}
    `

    if (rows.length > 0) {
      const row = rows[0]
      product = {
        id: row.id,
        name: row.name,
        price: Number(row.price),
        image: row.image || "",
        technical_drawing: row.technical_drawing,
        category: row.category,
        description: row.description,
        features: row.features || [],
        materials: row.materials,
        dimensions: row.dimensions,
        colors: row.colors,
        stock: row.stock,
        display_order: row.display_order,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }
    }
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
  }

  if (!product) {
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
}
