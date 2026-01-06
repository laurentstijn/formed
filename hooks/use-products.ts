"use client"

import { useState, useEffect } from "react"
import { getProducts, type Product } from "@/lib/supabase/products"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProducts()

    const interval = setInterval(() => {
      loadProducts()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    const data = await getProducts()
    setProducts(data)
    setIsLoading(false)
  }

  return { products, isLoading, refetch: loadProducts }
}

export async function getProductById(id: number): Promise<Product | null> {
  const { getProductById: fetchProduct } = await import("@/lib/supabase/products")
  return fetchProduct(id)
}
