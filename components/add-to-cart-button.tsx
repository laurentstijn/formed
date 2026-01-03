"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import type { Product } from "@/lib/products"
import { ShoppingCart, Check } from "lucide-react"
import { useState } from "react"

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button size="lg" className="w-full md:w-auto px-8" onClick={handleAddToCart}>
      {added ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Toegevoegd aan winkelwagen
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Toevoegen aan winkelwagen
        </>
      )}
    </Button>
  )
}
