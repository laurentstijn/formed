"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"

interface Variant {
  id?: number
  name: string
  price: string
  stock: number
  sku: string
}

interface VariantManagementPanelProps {
  productId: string
  onVariantSelect?: (variant: Variant | null) => void
}

export function VariantManagementPanel({ productId, onVariantSelect }: VariantManagementPanelProps) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productId) return

    console.log("[v0] Loading variants for productId:", productId)
    loadVariants()

    const handleVariantUpdate = () => {
      console.log("[v0] Variant updated event received, reloading...")
      loadVariants()
    }

    window.addEventListener("variantUpdated", handleVariantUpdate)
    return () => {
      console.log("[v0] Cleaning up variant panel")
      window.removeEventListener("variantUpdated", handleVariantUpdate)
    }
  }, [productId])

  const loadVariants = async () => {
    console.log("[v0] loadVariants called for productId:", productId)
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products/${productId}/variants`)
      console.log("[v0] Variants API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Variants data received:", data.variants?.length || 0, "variants")
        setVariants(data.variants || [])
      } else {
        console.error("[v0] Failed to load variants:", response.status)
        setVariants([])
      }
    } catch (error) {
      console.error("[v0] Error loading variants:", error)
      setVariants([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectVariant = (variant: Variant) => {
    console.log("[v0] Variant selected:", variant.name)
    setSelectedVariant(variant)
    onVariantSelect?.(variant)
  }

  const handleAddVariant = () => {
    console.log("[v0] Adding new variant")
    const newVariant: Variant = {
      name: "",
      price: "0.00",
      stock: 0,
      sku: "",
    }
    setSelectedVariant(newVariant)
    onVariantSelect?.(newVariant)
  }

  const handleDeleteVariant = async (variantId: number) => {
    if (!confirm("Weet je zeker dat je deze variant wilt verwijderen?")) return

    console.log("[v0] Deleting variant:", variantId)
    try {
      const response = await fetch(`/api/admin/products/${productId}/variants/${variantId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        console.log("[v0] Variant deleted successfully")
        await loadVariants()
        if (selectedVariant?.id === variantId) {
          setSelectedVariant(null)
          onVariantSelect?.(null)
        }
      } else {
        console.error("[v0] Failed to delete variant:", response.status)
      }
    } catch (error) {
      console.error("[v0] Error deleting variant:", error)
    }
  }

  console.log("[v0] VariantManagementPanel render - loading:", loading, "variants count:", variants.length)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-2">Product Varianten ({variants.length})</h3>
        <p className="text-sm text-muted-foreground mb-4">Klik op een variant om te bewerken</p>
        <Button onClick={handleAddVariant} className="w-full bg-transparent" variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe Variant
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <p className="text-sm text-muted-foreground p-4">Laden...</p>
        ) : variants.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4">
            Nog geen varianten. Klik op &quot;Nieuwe Variant&quot; om te beginnen.
          </p>
        ) : (
          <div className="space-y-2">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                  selectedVariant?.id === variant.id ? "bg-accent border-primary" : ""
                }`}
                onClick={() => handleSelectVariant(variant)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{variant.name}</p>
                    <p className="text-sm text-muted-foreground">€{variant.price}</p>
                    <p className="text-xs text-muted-foreground">Voorraad: {variant.stock}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteVariant(variant.id!)
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
