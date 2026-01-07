import { createClient } from "@/lib/supabase/client"

export type Product = {
  id: string
  name: string
  price: number
  image: string // Hoofdafbeelding
  gallery_images?: string[] // Toegevoegd: extra product afbeeldingen (lifestyle, details, etc.)
  technical_drawing?: string
  category: string
  description: string
  features: string[]
  materials?: string
  dimensions?: string
  colors?: {
    name: string
    hex: string
    stock: number
    images: string[]
  }[]
  stock?: number
  display_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching products:", error)
      return []
    }

    return (data || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image_url || product.image || "",
      gallery_images: product.gallery_images || [],
      technical_drawing: product.technical_drawing_url || product.technical_drawing,
      category: product.category,
      description: product.description,
      features: product.features || [],
      materials: product.materials,
      dimensions: product.dimensions,
      colors: product.colors,
      stock: product.stock,
      display_order: product.display_order,
      is_active: product.is_active,
      created_at: product.created_at,
      updated_at: product.updated_at,
    }))
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return []
  }
}

// Server-side: Fetch all products
export async function getProductsServer(): Promise<Product[]> {
  return getProducts()
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("products").select("*").order("display_order", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching all products:", error)
      return []
    }

    return (data || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image_url || product.image || "",
      gallery_images: product.gallery_images || [],
      technical_drawing: product.technical_drawing_url || product.technical_drawing,
      category: product.category,
      description: product.description,
      features: product.features || [],
      materials: product.materials,
      dimensions: product.dimensions,
      colors: product.colors,
      stock: product.stock,
      display_order: product.display_order,
      is_active: product.is_active,
      created_at: product.created_at,
      updated_at: product.updated_at,
    }))
  } catch (error) {
    console.error("[v0] Error fetching all products:", error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = createClient()

    const { data: product, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error || !product) {
      console.error("[v0] Error fetching product:", error)
      return null
    }

    console.log("[v0] Raw product from DB:", {
      id: product.id,
      name: product.name,
      image_url: product.image_url,
      technical_drawing_url: product.technical_drawing_url,
      gallery_images: product.gallery_images,
    })

    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image_url || product.image || "",
      gallery_images: product.gallery_images || [],
      technical_drawing: product.technical_drawing_url || product.technical_drawing,
      category: product.category,
      description: product.description,
      features: product.features || [],
      materials: product.materials,
      dimensions: product.dimensions,
      colors: product.colors,
      stock: product.stock,
      display_order: product.display_order,
      is_active: product.is_active,
      created_at: product.created_at,
      updated_at: product.updated_at,
    }
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
    return null
  }
}

// Server-side: Get single product by ID
export async function getProductByIdServer(id: string): Promise<Product | null> {
  return getProductById(id)
}

// Create a new product (admin only)
export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      price: product.price,
      image_url: product.image,
      gallery_images: product.gallery_images || [],
      technical_drawing_url: product.technical_drawing,
      category: product.category,
      description: product.description,
      features: product.features,
      materials: product.materials,
      dimensions: product.dimensions,
      colors: product.colors,
      stock: product.stock,
      display_order: product.display_order,
      is_active: product.is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating product:", error)
    throw error
  }

  return data
}

// Update a product (admin only)
export async function updateProduct(id: string, updates: Partial<Product>) {
  const supabase = createClient()

  // Build update object with proper field mappings
  const updateData: any = {}

  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.price !== undefined) updateData.price = updates.price
  if (updates.image !== undefined) updateData.image_url = updates.image
  if (updates.gallery_images !== undefined) updateData.gallery_images = updates.gallery_images
  if (updates.technical_drawing !== undefined) updateData.technical_drawing_url = updates.technical_drawing
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.features !== undefined) updateData.features = updates.features
  if (updates.materials !== undefined) updateData.materials = updates.materials
  if (updates.dimensions !== undefined) updateData.dimensions = updates.dimensions
  if (updates.colors !== undefined) updateData.colors = updates.colors
  if (updates.stock !== undefined) updateData.stock = updates.stock
  if (updates.display_order !== undefined) updateData.display_order = updates.display_order
  if (updates.is_active !== undefined) updateData.is_active = updates.is_active

  const { data, error } = await supabase.from("products").update(updateData).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating product:", error)
    throw error
  }

  return data
}

// Delete a product (admin only)
export async function deleteProduct(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting product:", error)
    throw error
  }
}

export async function updateProductOrder(updates: { id: string; display_order: number }[]) {
  const supabase = createClient()

  // Update each product's display_order
  const promises = updates.map(({ id, display_order }) =>
    supabase.from("products").update({ display_order }).eq("id", id),
  )

  const results = await Promise.all(promises)

  // Check for errors
  const errors = results.filter((result) => result.error)
  if (errors.length > 0) {
    console.error("[v0] Error updating product order:", errors)
    throw new Error("Failed to update product order")
  }
}
