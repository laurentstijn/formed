"use client"

import { useState } from "react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { ShareButtons } from "@/components/share-buttons"
import { ProductGallery } from "@/components/product-gallery"
import { ColorSelector } from "@/components/color-selector"
import { FileText } from "lucide-react"
import type { Product } from "@/lib/supabase/products"

interface ProductDetailClientProps {
  product: Product
  productUrl: string
}

export function ProductDetailClient({ product, productUrl }: ProductDetailClientProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)

  const displayImages =
    product.colors && product.colors.length > 0
      ? product.colors[selectedColorIndex].images
      : product.image
        ? [product.image]
        : []

  return (
    <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
      {/* Product Image Gallery */}
      <div>
        <ProductGallery images={displayImages} productName={product.name} />

        {product.technical_drawing && (
          <div className="mt-8 border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Technische Tekening</h3>
            </div>
            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={product.technical_drawing || "/placeholder.svg"}
                alt={`${product.name} technische tekening`}
                className="w-full h-auto"
              />
            </div>
            <a
              href={product.technical_drawing}
              download
              className="inline-flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Download technische tekening
            </a>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col">
        <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">{product.category}</p>
        <h1 className="text-4xl font-sans font-semibold text-foreground mb-4">{product.name}</h1>
        <p className="text-3xl font-semibold text-foreground mb-8">€{product.price.toFixed(2)}</p>

        <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

        <div className="mb-6">
          {product.stock === 0 ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Uitverkocht</p>
              <p className="text-sm">Dit product is momenteel niet op voorraad.</p>
            </div>
          ) : product.stock !== undefined && product.stock <= 5 ? (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg">
              <p className="text-sm">Nog maar {product.stock} stuks op voorraad</p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <p className="text-sm">Op voorraad</p>
            </div>
          )}
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className="mb-8 pb-8 border-b border-border">
            <ColorSelector
              colors={product.colors.map((c) => ({ name: c.name, hex: c.hex }))}
              onColorChange={setSelectedColorIndex}
            />
          </div>
        )}

        <AddToCartButton product={product} />

        {/* Share Buttons */}
        <div className="mt-6 pt-6 border-t border-border">
          <ShareButtons url={productUrl} title={`${product.name} - FORMD`} description={product.description} />
        </div>

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

          {product.materials && (
            <div className="border-t border-border pt-8">
              <h3 className="font-semibold text-foreground mb-2">Materiaal</h3>
              <p className="text-sm text-muted-foreground">{product.materials}</p>
            </div>
          )}

          {product.dimensions && (
            <div className="border-t border-border pt-8">
              <h3 className="font-semibold text-foreground mb-2">Afmetingen</h3>
              <p className="text-sm text-muted-foreground">{product.dimensions}</p>
            </div>
          )}

          <div className="border-t border-border pt-8">
            <h3 className="font-semibold text-foreground mb-2">Verzending</h3>
            <p className="text-sm text-muted-foreground">
              Verzendkosten: €7,50. Gratis verzending vanaf €75,00. Levering binnen 3-5 werkdagen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
