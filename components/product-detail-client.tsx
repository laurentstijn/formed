"use client"

import { useState, useMemo } from "react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { ShareButtons } from "@/components/share-buttons"
import { ProductGallery } from "@/components/product-gallery"
import { ColorSelector } from "@/components/color-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Product } from "@/lib/supabase/products"

type ProductVariant = {
  name: string
  price: number
  stock: number
  sku?: string
  colors?: any[]
  gallery_images?: any[]
  technical_drawing?: string
}

interface ProductDetailClientProps {
  product: Product
  productUrl: string
  variants: ProductVariant[]
}

export function ProductDetailClient({ product, productUrl, variants }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  console.log("[v0] Product name:", product.name)
  console.log("[v0] Technical drawing URL:", product.technical_drawing)
  console.log("[v0] Product image:", product.image)
  console.log("[v0] Gallery images:", product.gallery_images)
  console.log("[v0] Variants:", variants)

  const productTotalStock = useMemo(() => {
    if (product.colors && product.colors.length > 0) {
      return product.colors.reduce((total, color) => total + (color.stock || 0), 0)
    }
    return product.stock || 0
  }, [product.colors, product.stock])

  const allOptions = useMemo(() => {
    const mainProduct = {
      name: product.name,
      price: product.price,
      stock: productTotalStock, // Use calculated total stock instead of product.stock
      sku: "",
    }
    return [mainProduct, ...variants]
  }, [product.name, product.price, productTotalStock, variants])

  const displayColors = useMemo(() => {
    if (selectedVariant && selectedVariant.colors && selectedVariant.colors.length > 0) {
      return selectedVariant.colors
    }
    return product.colors || []
  }, [selectedVariant, product.colors])

  const sortedColors = useMemo(() => {
    if (!displayColors || displayColors.length === 0) return []

    return [...displayColors].sort((a, b) => {
      const aIsMain = a.images?.[0] === product.image
      const bIsMain = b.images?.[0] === product.image
      const aStock = a.stock || 0
      const bStock = b.stock || 0

      if (aIsMain && aStock > 0) return -1
      if (bIsMain && bStock > 0) return 1

      if (aStock > 0 && bStock === 0) return -1
      if (aStock === 0 && bStock > 0) return 1

      if (aIsMain) return -1
      if (bIsMain) return 1

      return 0
    })
  }, [displayColors, product.image])

  const defaultColorIndex = useMemo(() => {
    if (!sortedColors || sortedColors.length === 0) return 0

    const firstInStockIndex = sortedColors.findIndex((color) => (color.stock || 0) > 0)

    return firstInStockIndex !== -1 ? firstInStockIndex : 0
  }, [sortedColors])

  const [selectedColorIndex, setSelectedColorIndex] = useState(defaultColorIndex)

  const displayImages = (() => {
    const variantGalleryImages = selectedVariant?.gallery_images || []
    const colorImages = sortedColors && sortedColors.length > 0 ? sortedColors[selectedColorIndex].images : []
    const galleryImages = variantGalleryImages.length > 0 ? variantGalleryImages : product.gallery_images || []
    const mainImage = product.image ? [product.image] : []
    const technicalDrawing = selectedVariant?.technical_drawing
      ? [selectedVariant.technical_drawing]
      : product.technical_drawing
        ? [product.technical_drawing]
        : []

    if (colorImages.length > 0) {
      return [...colorImages, ...technicalDrawing, ...galleryImages]
    } else if (galleryImages.length > 0) {
      return [...mainImage, ...technicalDrawing, ...galleryImages]
    } else if (technicalDrawing.length > 0) {
      return [...mainImage, ...technicalDrawing]
    } else {
      return mainImage
    }
  })()

  console.log("[v0] Final display images:", displayImages)

  const availableStock = selectedVariant
    ? selectedVariant.stock
    : sortedColors && sortedColors.length > 0
      ? sortedColors[selectedColorIndex]?.stock || 0
      : productTotalStock // Use calculated total stock instead of product.stock

  const displayPrice = selectedVariant ? selectedVariant.price : product.price

  return (
    <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
      <div className="flex flex-col md:order-2">
        <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">{product.category}</p>
        <h1 className="text-4xl font-sans font-semibold text-foreground mb-4">{product.name}</h1>
        <p className="text-3xl font-semibold text-foreground mb-8">€{displayPrice.toFixed(2)}</p>

        <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

        <div className="mb-6">
          {availableStock === 0 ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Uitverkocht</p>
              <p className="text-sm">Dit product is momenteel niet op voorraad.</p>
            </div>
          ) : availableStock !== undefined && availableStock <= 5 ? (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg">
              <p className="text-sm">Nog maar {availableStock} stuks op voorraad</p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <p className="text-sm">Op voorraad</p>
            </div>
          )}
        </div>

        {variants.length > 0 && (
          <div className="mb-6 space-y-2">
            <Label>Kies variant</Label>
            <Select
              value={selectedVariant?.name || product.name}
              onValueChange={(name) => {
                if (name === product.name) {
                  setSelectedVariant(null)
                } else {
                  const variant = variants.find((v) => v.name === name)
                  setSelectedVariant(variant || null)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een variant" />
              </SelectTrigger>
              <SelectContent>
                {allOptions.map((option) => (
                  <SelectItem key={option.name} value={option.name}>
                    {option.name} - €{option.price.toFixed(2)}
                    {option.stock === 0 && " (Uitverkocht)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {sortedColors && sortedColors.length > 0 && (
          <div className="mb-8">
            <ColorSelector
              colors={sortedColors.map((c) => ({ name: c.name, hex: c.hex, stock: c.stock }))}
              onColorChange={setSelectedColorIndex}
              initialColorIndex={defaultColorIndex}
            />
          </div>
        )}

        <div className="md:hidden mb-8">
          <ProductGallery images={displayImages} productName={product.name} isOutOfStock={availableStock === 0} />
        </div>

        <AddToCartButton
          product={product}
          availableStock={availableStock}
          selectedColor={sortedColors?.[selectedColorIndex]?.name}
          selectedVariant={selectedVariant}
        />

        <div className="mt-6 pt-6 border-t border-border">
          <ShareButtons url={productUrl} title={`${product.name} - FORMD`} description={product.description} />
        </div>

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

      <div className="hidden md:block md:order-1">
        <ProductGallery images={displayImages} productName={product.name} isOutOfStock={availableStock === 0} />
      </div>
    </div>
  )
}
