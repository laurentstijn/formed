"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useProducts } from "@/hooks/use-products"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function HomePage() {
  const { products, isLoading } = useProducts()
  const router = useRouter()

  const getProductStock = (product: any) => {
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors.reduce((total: number, color: any) => {
        if (!color) return total
        return total + (color.stock || 0)
      }, 0)
    }
    return product.stock || 0
  }

  const handleProductClick = (productId: number, productName: string) => {
    router.push(`/product/${productId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="mb-8 flex justify-center">
            <Image
              src="/formed-in-steel-logo.png"
              alt="formd in steel"
              width={400}
              height={100}
              className="h-auto w-full max-w-xs md:max-w-lg"
              priority
            />
          </div>
          <p className="text-lg text-muted-foreground mb-8 text-pretty leading-relaxed">
            Ontdek onze zorgvuldig geselecteerde collectie van formd in steel
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-sans font-semibold text-foreground mb-12 text-center">Onze Collectie</h2>
          {isLoading ? (
            <div className="text-center text-muted-foreground">Producten laden...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id, product.name)}
                  className="group cursor-pointer"
                >
                  <div className="bg-card rounded-lg overflow-hidden border border-border transition-all hover:shadow-lg hover:border-foreground/20">
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (target.src !== "/placeholder.svg") {
                            target.src = "/placeholder.svg"
                          }
                        }}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {(() => {
                        const totalStock = getProductStock(product)
                        return totalStock === 0 ? (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">Uitverkocht</span>
                          </div>
                        ) : null
                      })()}
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{product.category}</p>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-semibold text-foreground">€{product.price.toFixed(2)}</p>
                        {(() => {
                          const totalStock = getProductStock(product)
                          return (
                            <span
                              className={`text-xs font-medium ${
                                totalStock === 0
                                  ? "text-red-500"
                                  : totalStock <= 5
                                    ? "text-orange-500"
                                    : "text-green-600"
                              }`}
                            >
                              {totalStock === 0 ? "Uitverkocht" : `${totalStock} op voorraad`}
                            </span>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
