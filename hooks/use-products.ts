"use client"

import { useState, useEffect } from "react"
import { getProducts, type Product } from "@/lib/supabase/products"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProducts()

    // Products only load on mount, manual refresh still available via refetch
  }, [])

  const loadProducts = async () => {
    if (products.length === 0) {
      setIsLoading(true)
    }
    const data = await getProducts()
    setProducts(data)
    setIsLoading(false)
  }

  return { products, isLoading, refetch: loadProducts }
}

export async function getProductById(id: string): Promise<Product | null> {
  const { getProductById: fetchProduct } = await import("@/lib/supabase/products")
  return fetchProduct(id)
}
