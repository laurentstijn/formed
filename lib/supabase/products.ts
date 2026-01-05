import { createClient } from "@/lib/supabase/client"

export type Product = {
  id: number
  name: string
  price: number
  image: string // Reverted from 'images' array back to single 'image' string to match database
  technical_drawing?: string
  category: string
  description: string
  features: string[]
  materials?: string
  dimensions?: string
  colors?: {
    name: string
    hex: string
    inStock: boolean
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=*&is_active=eq.true&order=display_order.asc`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return (data || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image || "", // Reverted to single image field
      technical_drawing: product.technical_drawing,
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=*&order=display_order.asc`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return (data || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image || "", // Reverted to single image field
      technical_drawing: product.technical_drawing,
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

// Get single product by ID
export async function getProductById(id: number): Promise<Product | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data || data.length === 0) return null

    const product = data[0]

    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image || "", // Reverted to single image field
      technical_drawing: product.technical_drawing,
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
export async function getProductByIdServer(id: number): Promise<Product | null> {
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
      image: product.image, // Reverted to single image field
      technical_drawing: product.technical_drawing,
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
export async function updateProduct(id: number, updates: Partial<Product>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .update({
      name: updates.name,
      price: updates.price,
      image: updates.image, // Reverted to single image field
      technical_drawing: updates.technical_drawing,
      category: updates.category,
      description: updates.description,
      features: updates.features,
      materials: updates.materials,
      dimensions: updates.dimensions,
      colors: updates.colors,
      stock: updates.stock,
      display_order: updates.display_order,
      is_active: updates.is_active,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating product:", error)
    throw error
  }

  return data
}

// Delete a product (admin only)
export async function deleteProduct(id: number) {
  const supabase = createClient()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting product:", error)
    throw error
  }
}

export async function updateProductOrder(updates: { id: number; display_order: number }[]) {
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
