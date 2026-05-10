"use client"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { useProducts } from "@/hooks/use-products"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { products, isLoading } = useProducts()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
    return cats as string[]
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = products
    if (selectedCategory) {
      result = products.filter((p) => p.category === selectedCategory)
    }
    return result
  }, [products, selectedCategory])

  const getDisplayImage = (product: any) => {
    // Check if current image is a gallery image
    const isGalleryImage = product.gallery_images?.includes(product.image)

    if (isGalleryImage) {
      // Gallery images are always shown (fixed)
      return product.image
    }

    // Check if current image is from a color that's in stock
    const currentColor = product.colors?.find((c: any) => c.images?.[0] === product.image)

    if (currentColor && currentColor.stock > 0) {
      // Current color is in stock, use it
      return product.image
    }

    // Current color is out of stock or not set, find first color in stock
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      const inStockColor = product.colors.find((color: any) => color?.stock > 0)
      if (inStockColor && inStockColor.images && inStockColor.images.length > 0) {
        return inStockColor.images[0]
      }
      // If no colors in stock, use first color's image
      const firstColor = product.colors[0]
      if (firstColor && firstColor.images && firstColor.images.length > 0) {
        return firstColor.images[0]
      }
    }

    // Fallback to product.image
    return product.image
  }

  const isProductOutOfStock = (product: any) => {
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors.every((color: any) => !color?.stock || color.stock === 0)
    }
    return product.stock === 0
  }

  const getProductStock = (product: any) => {
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors.reduce((total: number, color: any) => {
        if (!color || !color.stock) return total
        return total + color.stock
      }, 0)
    }
    return product.stock || 0
  }

  const handleProductClick = (productId: number | string, productName: string) => {
    const nameLower = productName.toLowerCase();
    if (nameLower.includes("eigen ontwerp")) {
      router.push("/eigen-ontwerp")
    } else if (nameLower.includes("douchegoot")) {
      router.push("/douchegoot")
    } else if (nameLower.includes("naambordje")) {
      router.push("/naambordje")
    } else if (nameLower.includes("hondenlabel") || nameLower.includes("dog tag")) {
      router.push("/hondenlabel")
    } else {
      router.push(`/product/${productId}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Products Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-sans font-semibold text-foreground mb-8 text-center">Onze Collectie</h2>

          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Alle Producten
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-muted-foreground">Producten laden...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id, product.name)}
                  className="group cursor-pointer"
                >
                  <div className="bg-card rounded-lg overflow-hidden border border-border transition-all hover:shadow-lg hover:border-foreground/20">
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      <img
                        src={getDisplayImage(product) || "/placeholder.svg"}
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
                      {isProductOutOfStock(product) && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">Uitverkocht</span>
                        </div>
                      )}
                      {product.is_new && !isProductOutOfStock(product) && (
                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                          Nieuw
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{product.category}</p>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-semibold text-foreground">
                          {product.name.toLowerCase().includes('eigen ontwerp') ? 'Bereken live' : `€${product.price.toFixed(2)}`}
                        </p>
                        {product.name.toLowerCase().includes('eigen ontwerp') ? (
                          <span className="text-xs font-medium text-black">Upload DXF</span>
                        ) : (() => {
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
                              {totalStock === 0 
                                ? "Uitverkocht" 
                                : totalStock > 50 
                                  ? "Op bestelling gemaakt" 
                                  : `${totalStock} op voorraad`}
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
