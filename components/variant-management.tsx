"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import type { ProductVariant } from "@/lib/supabase/variants"

type VariantManagementProps = {
  productId: number
  variants: ProductVariant[]
  onVariantsChange: () => void
}

export function VariantManagement({ productId, variants, onVariantsChange }: VariantManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    image_url: "",
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      const data = await response.json()
      if (data.url) {
        setFormData({ ...formData, image_url: data.url })
        toast.success("Afbeelding geüpload")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Fout bij uploaden van afbeelding")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Naam en prijs zijn verplicht")
      return
    }

    try {
      const response = await fetch("/api/admin/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          name: formData.name,
          sku: formData.sku || `VAR-${Date.now()}`,
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock) || 0,
          image_url: formData.image_url || null,
          is_active: true,
        }),
      })

      if (response.ok) {
        toast.success("Variant toegevoegd")
        setIsDialogOpen(false)
        setFormData({ name: "", sku: "", price: "", stock: "", image_url: "" })
        onVariantsChange()
      } else {
        toast.error("Fout bij toevoegen variant")
      }
    } catch (error) {
      console.error("Error creating variant:", error)
      toast.error("Fout bij toevoegen variant")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze variant wilt verwijderen?")) return

    try {
      const response = await fetch(`/api/admin/variants/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Variant verwijderd")
        onVariantsChange()
      } else {
        toast.error("Fout bij verwijderen variant")
      }
    } catch (error) {
      console.error("Error deleting variant:", error)
      toast.error("Fout bij verwijderen variant")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Varianten</h3>
        <Button type="button" onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Variant Toevoegen
        </Button>
      </div>

      {variants.length > 0 ? (
        <div className="space-y-2">
          {variants.map((variant) => (
            <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {variant.image_url && (
                  <img
                    src={variant.image_url || "/placeholder.svg"}
                    alt={variant.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium">{variant.name}</p>
                  <p className="text-sm text-muted-foreground">
                    €{variant.price.toFixed(2)} • Voorraad: {variant.stock}
                  </p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(variant.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nog geen varianten toegevoegd</p>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Variant Toevoegen</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="variant-name">Naam *</Label>
              <Input
                id="variant-name"
                placeholder="bijv. Klein - Zwart"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="variant-sku">SKU</Label>
              <Input
                id="variant-sku"
                placeholder="Optioneel"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="variant-price">Prijs (€) *</Label>
                <Input
                  id="variant-price"
                  type="number"
                  step="0.01"
                  placeholder="14.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="variant-stock">Voorraad</Label>
                <Input
                  id="variant-stock"
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Afbeelding (optioneel)</Label>
              {formData.image_url ? (
                <div className="space-y-2">
                  <img
                    src={formData.image_url || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, image_url: "" })}
                  >
                    Verwijder afbeelding
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuleren
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={uploading}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
