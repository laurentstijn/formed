import Link from "next/link"
import { notFound } from "next/navigation"
import { CartButton } from "@/components/cart-button"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { getProductById, products } from "@/lib/products"
import { ArrowLeft } from "lucide-react"

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }))
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(Number(params.id))

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/formed-primary.png" alt="FORMED" className="h-8 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Shop
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Over Ons
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <CartButton />
        </div>
      </header>

      {/* Product Detail */}
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

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">{product.category}</p>
            <h1 className="text-4xl font-sans font-semibold text-foreground mb-4">{product.name}</h1>
            <p className="text-3xl font-semibold text-foreground mb-8">€{product.price.toFixed(2)}</p>

            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            <AddToCartButton product={product} />

            {/* Product Details */}
            <div className="mt-12 space-y-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Kenmerken</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-foreground mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-border pt-8">
                <h3 className="font-semibold text-foreground mb-2">Materiaal</h3>
                <p className="text-sm text-muted-foreground">{product.materials}</p>
              </div>

              <div className="border-t border-border pt-8">
                <h3 className="font-semibold text-foreground mb-2">Afmetingen</h3>
                <p className="text-sm text-muted-foreground">{product.dimensions}</p>
              </div>

              <div className="border-t border-border pt-8">
                <h3 className="font-semibold text-foreground mb-2">Verzending</h3>
                <p className="text-sm text-muted-foreground">
                  Gratis verzending binnen Nederland. Levering binnen 3-5 werkdagen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
