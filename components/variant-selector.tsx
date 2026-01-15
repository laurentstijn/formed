"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { ProductVariant } from "@/lib/supabase/variants"

type VariantSelectorProps = {
  variants: ProductVariant[]
  onVariantSelect: (variant: ProductVariant) => void
}

export function VariantSelector({ variants, onVariantSelect }: VariantSelectorProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>("")

  const handleSelect = (variantId: string) => {
    setSelectedVariantId(variantId)
    const variant = variants.find((v) => v.id === variantId)
    if (variant) {
      onVariantSelect(variant)
    }
  }

  if (variants.length === 0) return null

  return (
    <div className="space-y-2">
      <Label>Kies een variant</Label>
      <Select value={selectedVariantId} onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecteer een optie..." />
        </SelectTrigger>
        <SelectContent>
          {variants.map((variant) => (
            <SelectItem key={variant.id} value={variant.id}>
              {variant.name} - €{variant.price.toFixed(2)}
              {variant.stock === 0 && " (Uitverkocht)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
