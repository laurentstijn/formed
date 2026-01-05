"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createProduct, updateProduct, deleteProduct, updateProductOrder, type Product } from "@/lib/supabase/products"
import { Upload, GripVertical, Pencil, Trash2 } from "lucide-react"

interface AdminDashboardProps {
  userEmail: string
}

export default function AdminDashboard({ userEmail }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    category: "DECORATION",
    description: "",
    features: "",
    materials: "",
    dimensions: "",
  })

  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=*&order=display_order.asc`,
        {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      name: formData.name,
      price: Number.parseFloat(formData.price),
      image: formData.image, // Reverted from images array to single image string
      category: formData.category,
      description: formData.description,
      features: formData.features.split(",").map((f) => f.trim()),
      materials: formData.materials,
      dimensions: formData.dimensions,
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
      } else {
        await createProduct(productData)
      }

      setFormData({
        name: "",
        price: "",
        image: "",
        category: "DECORATION",
        description: "",
        features: "",
        materials: "",
        dimensions: "",
      })
      setEditingProduct(null)
      setIsAddingNew(false)
      await loadProducts()
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Er is een fout opgetreden bij het opslaan van het product")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsAddingNew(true)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image || "", // Reverted from images[0] to single image field
      category: product.category,
      description: product.description,
      features: product.features?.join(", ") || "",
      materials: product.materials || "",
      dimensions: product.dimensions || "",
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Weet je zeker dat je dit product wilt verwijderen?")) return

    try {
      await deleteProduct(id)
      await loadProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Er is een fout opgetreden bij het verwijderen van het product")
    }
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setIsAddingNew(false)
    setFormData({
      name: "",
      price: "",
      image: "",
      category: "DECORATION",
      description: "",
      features: "",
      materials: "",
      dimensions: "",
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Selecteer een geldig afbeeldingsbestand")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Afbeelding is te groot (max 5MB)")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      setFormData((prev) => ({ ...prev, image: data.url }))
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Er is een fout opgetreden bij het uploaden van de afbeelding")
    } finally {
      setIsUploading(false)
    }
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

    // Reorder products array
    const newProducts = [...products]
    const [removed] = newProducts.splice(draggedItem, 1)
    newProducts.splice(dropIndex, 0, removed)

    // Update display_order for all affected products
    const updates = newProducts.map((product, index) => ({
      id: product.id,
      display_order: index,
    }))

    setProducts(newProducts)
    setDraggedItem(null)

    // Save to database
    try {
      await updateProductOrder(updates)
    } catch (error) {
      console.error("Error updating order:", error)
      alert("Er is een fout opgetreden bij het opslaan van de volgorde")
      await loadProducts() // Reload on error
    }
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Laden...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-sans font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Ingelogd als {userEmail}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Uitloggen
          </Button>
        </div>

        {!isAddingNew && (
          <div className="mb-6">
            <Button onClick={() => setIsAddingNew(true)}>Nieuw Product Toevoegen</Button>
          </div>
        )}

        {isAddingNew && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingProduct ? "Product Bewerken" : "Nieuw Product"}</CardTitle>
              <CardDescription>
                {editingProduct ? "Wijzig de productgegevens" : "Voeg een nieuw product toe aan de webshop"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Productnaam</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Prijs (€)</Label>
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
                  <Label htmlFor="image">Productafbeelding</Label>
                  <div className="space-y-4">
                    {formData.image && (
                      <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={formData.image || "/placeholder.svg"}
                          alt="Preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? "Bezig met uploaden..." : "Afbeelding Uploaden"}
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Input
                        placeholder="Of voer een URL in"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Upload een afbeelding (max 5MB) of voer een URL in</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categorie</Label>
                  <Input
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Features (gescheiden door komma's)</Label>
                  <Input
                    id="features"
                    placeholder="Feature 1, Feature 2, Feature 3"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="materials">Materialen</Label>
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
                      placeholder="H: 15cm, B: 10cm, D: 5cm"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingProduct ? "Wijzigingen Opslaan" : "Product Toevoegen"}</Button>
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Annuleren
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {products.map((product, index) => (
            <Card
              key={product.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`cursor-move transition-opacity ${draggedItem === index ? "opacity-50" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Drag handle */}
                  <div className="flex-shrink-0">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Product image */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={product.image || "/placeholder.svg"} // Reverted from images[0] to single image field
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">€{product.price.toFixed(2)}</p>
                  </div>

                  {/* Category */}
                  <div className="hidden md:block flex-shrink-0">
                    <span className="text-sm text-muted-foreground">{product.category}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                      <span className="ml-2 hidden sm:inline">Bewerken</span>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-2 hidden sm:inline">Verwijderen</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Geen producten gevonden. Voeg je eerste product toe!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
