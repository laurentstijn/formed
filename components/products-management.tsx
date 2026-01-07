"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createProduct, updateProduct, deleteProduct, updateProductOrder, type Product } from "@/lib/supabase/products"
import { getAllProducts } from "@/lib/supabase/products"
import { GripVertical, Pencil, Trash2, Plus, Power, PowerOff, X, Upload, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "sonner"

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({})
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [showCategoryInput, setShowCategoryInput] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    gallery_images: [] as string[], // Added gallery_images to formData
    technical_drawing: "",
    isActive: true,
    colors: [] as { name: string; hex: string; stock: number; images: string[] }[],
    features: "",
    materials: "",
    dimensions: "",
    main_image_source: "" as string,
  })

  const addCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()])
      setFormData({ ...formData, category: newCategory.trim() })
      setNewCategory("")
      setShowCategoryInput(false)
    }
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await getAllProducts()
      setProducts(response)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await getAllProducts()
      const uniqueCategories = Array.from(new Set(response.map((p) => p.category).filter(Boolean)))
      setCategories(uniqueCategories as string[])
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const handleTechnicalDrawingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 5 * 1024 * 1024 // 5MB for technical drawings
    if (file.size > maxSize) {
      toast.error("Technische tekening is te groot (max 5MB)")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()

      setFormData((prev) => ({ ...prev, technical_drawing: url }))
      toast.success("Technische tekening geüpload")
    } catch (error) {
      toast.error("Fout bij uploaden technische tekening")
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast.error("Afbeelding is te groot (max 2MB)")
      return
    }

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()

      setFormData((prev) => ({
        ...prev,
        gallery_images: [...prev.gallery_images, url],
      }))
      toast.success("Afbeelding toegevoegd aan gallery")
    } catch (error) {
      toast.error("Fout bij uploaden afbeelding")
    } finally {
      setUploading(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }))
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image || "",
      gallery_images: product.gallery_images || [], // Load gallery_images when editing
      technical_drawing: product.technical_drawing || "",
      category: product.category,
      description: product.description,
      features: Array.isArray(product.features) ? product.features.join(", ") : "",
      materials: product.materials || "",
      dimensions: product.dimensions || "",
      colors: product.colors || [],
      isActive: product.is_active ?? true,
      main_image_source: (product as any).main_image_source || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Product verwijderen?")) return

    try {
      await deleteProduct(id)
      await loadProducts()
      toast.success("Product verwijderd")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Fout bij verwijderen")
    }
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setIsDialogOpen(false)
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      gallery_images: [], // Reset gallery_images
      technical_drawing: "",
      isActive: true,
      colors: [],
      features: "",
      materials: "",
      dimensions: "",
      main_image_source: "",
    })
  }

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product.id, { is_active: !product.is_active })
      await loadProducts()
      toast.success("Status bijgewerkt")
    } catch (error) {
      console.error("Error toggling product:", error)
      toast.error("Fout bij wijzigen status")
    }
  }

  const addColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { name: "", hex: "#000000", stock: 0, images: [] }],
    })
  }

  const updateColor = (index: number, field: string, value: any) => {
    const newColors = [...formData.colors]
    newColors[index] = { ...newColors[index], [field]: value }
    setFormData({ ...formData, colors: newColors })
  }

  const removeColor = (index: number) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    })
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null)
      return
    }

    const newProducts = [...products]
    const [removed] = newProducts.splice(draggedItem, 1)
    newProducts.splice(dropIndex, 0, removed)

    const updates = newProducts.map((product, index) => ({
      id: product.id,
      display_order: index,
    }))

    setProducts(newProducts)
    setDraggedItem(null)

    try {
      await updateProductOrder(updates)
    } catch (error) {
      console.error("Error updating order:", error)
      await loadProducts()
    }
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const getTotalStock = (product: Product) => {
    if (!product.colors || !Array.isArray(product.colors)) return 0
    return product.colors.filter((color) => color != null).reduce((sum, color) => sum + (color?.stock || 0), 0)
  }

  const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, colorIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast.error("Afbeelding is te groot (max 2MB)")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()

      setFormData((prev) => {
        const newColors = [...prev.colors]
        newColors[colorIndex].images = [url]
        return { ...prev, colors: newColors }
      })

      toast.success("Afbeelding succesvol geüpload!")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Fout bij uploaden afbeelding")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.colors.length > 0) {
      const hasImages = formData.colors.some((c) => c.images && c.images.length > 0)
      if (!hasImages) {
        toast.error("Upload minimaal één afbeelding per kleur")
        return
      }

      if (!formData.image) {
        const firstImage = formData.colors.find((c) => c.images && c.images.length > 0)?.images[0]
        if (firstImage) {
          setFormData((prev) => ({ ...prev, image: firstImage }))
        }
      }
    }

    const featuresArray = formData.features
      ? formData.features
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f.length > 0)
      : []

    const productData = {
      name: formData.name,
      price: Number.parseFloat(formData.price),
      image: formData.image || "",
      gallery_images: formData.gallery_images,
      technical_drawing: formData.technical_drawing,
      category: formData.category,
      description: formData.description,
      features: featuresArray,
      materials: formData.materials,
      dimensions: formData.dimensions,
      colors: formData.colors.filter((c) => c != null),
      is_active: formData.isActive,
      main_image_source: formData.main_image_source,
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
        toast.success("Product bijgewerkt!")
      } else {
        await createProduct(productData)
        toast.success("Product aangemaakt!")
      }

      handleCancelEdit()
      await loadProducts()
    } catch (error) {
      console.error("[v0] Error updating product:", error)
      toast.error(`Fout bij opslaan: ${error instanceof Error ? error.message : "Onbekende fout"}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg">Producten laden...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Producten</h1>
          <p className="text-muted-foreground mt-1">Beheer je productcatalogus</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nieuw Product
        </Button>
      </div>

      {/* Product List */}
      <div className="grid gap-4">
        {products.map((product, index) => (
          <Card
            key={product.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`cursor-move transition-opacity ${
              draggedItem === index ? "opacity-50" : product.is_active ? "" : "opacity-40"
            }`}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <GripVertical className="h-5 w-5 text-muted-foreground" />

              <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">€{product.price}</p>
                {product.colors && product.colors.length > 0 ? (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {product.colors.map((color, idx) => (
                      <span key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}: {color.stock}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">{getTotalStock(product)} op voorraad</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleToggleActive(product)}>
                  {product.is_active ? (
                    <Power className="h-4 w-4 text-green-600" />
                  ) : (
                    <PowerOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent
          className="max-w-none w-[90vw] max-h-[90vh] overflow-y-auto"
          style={{ maxWidth: "1600px", width: "90vw" }}
        >
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Product bewerken" : "Nieuw product"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Productnaam *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Prijs (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categorie (optioneel)</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  if (value === "__new__") {
                    setShowCategoryInput(true)
                  } else if (value === "__none__") {
                    setFormData({ ...formData, category: "" })
                  } else {
                    setFormData({ ...formData, category: value })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Geen categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Geen categorie</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">+ Nieuwe categorie...</SelectItem>
                </SelectContent>
              </Select>

              {showCategoryInput && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Nieuwe categorie naam"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addCategory()
                      }
                    }}
                  />
                  <Button type="button" onClick={addCategory}>
                    Toevoegen
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCategoryInput(false)
                      setNewCategory("")
                    }}
                  >
                    Annuleer
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2 border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Label>Product Gallery Afbeeldingen</Label>
                  <p className="text-sm text-muted-foreground">Algemene product foto's (lifestyle, details, context)</p>
                </div>
                <Label htmlFor="gallery-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Afbeelding toevoegen
                    </span>
                  </Button>
                </Label>
                <Input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryImageUpload}
                  disabled={uploading}
                />
              </div>

              {formData.gallery_images.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {formData.gallery_images.map((imageUrl, index) => {
                    const isSelected = formData.image === imageUrl
                    return (
                      <button
                        key={`gallery-${index}`}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: imageUrl })}
                        className={`relative border-2 rounded-lg overflow-hidden hover:border-primary transition-colors ${
                          isSelected ? "border-primary ring-2 ring-primary" : "border-gray-200"
                        }`}
                      >
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs p-2 font-medium">
                          Gallery Foto {index + 1}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                            Hoofdfoto
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <p className="text-sm">Geen gallery afbeeldingen toegevoegd</p>
                </div>
              )}
            </div>

            {/* Technical Drawing Section */}
            <div className="space-y-2 border-t pt-6">
              <Label>Technische Tekening</Label>
              {formData.technical_drawing ? (
                <div className="relative border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4">
                    <img
                      src={formData.technical_drawing || "/placeholder.svg"}
                      alt="Technische tekening preview"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between bg-white border-t">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Technische tekening geüpload</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => setFormData({ ...formData, technical_drawing: "" })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <Label htmlFor="technical-drawing" className="cursor-pointer text-primary hover:underline block">
                    Technische tekening uploaden
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG (max 5MB)</p>
                  <Input
                    id="technical-drawing"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleTechnicalDrawingUpload}
                    disabled={uploading}
                  />
                </div>
              )}
            </div>

            {/* Colors Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <Label>Kleuren</Label>
                <Button type="button" variant="outline" size="sm" onClick={addColor}>
                  <Plus className="h-4 w-4 mr-2" />
                  Kleur toevoegen
                </Button>
              </div>

              {formData.colors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
                  Geen kleuren toegevoegd. Klik op "Kleur toevoegen" om te beginnen.
                </p>
              ) : (
                <Accordion type="multiple" className="space-y-4">
                  {formData.colors.map((color, index) => {
                    const isSelected = formData.image === color.images[0]
                    return (
                      <AccordionItem key={index} value={`color-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="font-medium">{color.name || "Nieuwe kleur"}</span>
                            <span className="text-sm text-muted-foreground">{color.stock} op voorraad</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Kleur Naam</Label>
                              <Input
                                value={color.name}
                                onChange={(e) => updateColor(index, "name", e.target.value)}
                                placeholder="bijv. Mint Green"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Kleurcode</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  placeholder="#000000"
                                  value={color.hex}
                                  onChange={(e) => {
                                    let hex = e.target.value
                                    // Auto-add # if missing
                                    if (hex && !hex.startsWith("#")) {
                                      hex = "#" + hex
                                    }
                                    updateColor(index, "hex", hex)
                                  }}
                                  className="flex-1"
                                />
                                <Input
                                  type="color"
                                  value={color.hex}
                                  onChange={(e) => updateColor(index, "hex", e.target.value)}
                                  className="w-16 h-10 cursor-pointer"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Voorraad</Label>
                              <Input
                                type="number"
                                min="0"
                                value={color.stock}
                                onChange={(e) => updateColor(index, "stock", Number.parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Afbeelding voor deze kleur</Label>
                            {color.images && color.images.length > 0 ? (
                              <div className="relative w-full h-64 border rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  key={color.images[0]}
                                  src={color.images[0] || "/placeholder.svg"}
                                  alt={color.name}
                                  className="w-full h-full object-contain bg-white"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                                  onClick={() => updateColor(index, "images", [])}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <Label
                                  htmlFor={`color-image-${index}`}
                                  className="cursor-pointer text-primary hover:underline"
                                >
                                  Afbeelding uploaden
                                </Label>
                                <Input
                                  id={`color-image-${index}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleColorImageUpload(e, index)}
                                  disabled={uploading}
                                />
                              </div>
                            )}
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeColor(index)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Kleur verwijderen
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              )}
            </div>

            {/* Main Image Selection */}
            {(formData.colors.some((c) => c.images && c.images.length > 0) || formData.gallery_images.length > 0) && (
              <div className="border-t pt-6">
                <Label className="mb-4 block">Hoofdafbeelding selecteren *</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Kies welke afbeelding als hoofdfoto op de homepage wordt getoond
                </p>
                <div className="grid grid-cols-4 gap-4">
                  {/* Gallery images */}
                  {formData.gallery_images.map((imageUrl, idx) => {
                    const isSelected = formData.image === imageUrl
                    return (
                      <button
                        key={`gallery-${idx}`}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: imageUrl })}
                        className={`relative border-2 rounded-lg overflow-hidden hover:border-primary transition-colors ${
                          isSelected ? "border-primary ring-2 ring-primary" : "border-gray-200"
                        }`}
                      >
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs p-2 font-medium">
                          Gallery Foto {idx + 1}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                            Hoofdfoto
                          </div>
                        )}
                      </button>
                    )
                  })}

                  {/* Color images */}
                  {formData.colors
                    .filter((c) => c.images && c.images.length > 0)
                    .map((color, idx) => {
                      const isSelected = formData.image === color.images[0]
                      return (
                        <button
                          key={`color-${idx}`}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: color.images[0] })}
                          className={`relative border-2 rounded-lg overflow-hidden hover:border-primary transition-colors ${
                            isSelected ? "border-primary ring-2 ring-primary" : "border-gray-200"
                          }`}
                        >
                          <img
                            src={color.images[0] || "/placeholder.svg"}
                            alt={color.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full border border-white"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.name}
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                              Hoofdfoto
                            </div>
                          )}
                        </button>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="materials">Materiaal</Label>
                <Input
                  id="materials"
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dimensions">Afmetingen</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (komma gescheiden)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Compact design, Eenvoudige montage, Veelzijdig gebruik"
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Annuleren
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Uploaden..." : editingProduct ? "Wijzigingen opslaan" : "Product aanmaken"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
