import { createClient } from "@/lib/supabase/server"

export type ProductVariant = {
  id: string
  product_id: number
  name: string
  sku: string
  price: number
  stock: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getProductVariants(productId: number): Promise<ProductVariant[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("name")

  if (error) {
    console.error("Error fetching variants:", error)
    return []
  }

  return data || []
}

export async function createVariant(
  variant: Omit<ProductVariant, "id" | "created_at" | "updated_at">,
): Promise<ProductVariant | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("product_variants").insert(variant).select().single()

  if (error) {
    console.error("Error creating variant:", error)
    return null
  }

  return data
}

export async function updateVariant(id: string, variant: Partial<ProductVariant>): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from("product_variants").update(variant).eq("id", id)

  if (error) {
    console.error("Error updating variant:", error)
    return false
  }

  return true
}

export async function deleteVariant(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from("product_variants").delete().eq("id", id)

  if (error) {
    console.error("Error deleting variant:", error)
    return false
  }

  return true
}
