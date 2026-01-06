"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import type { Product } from "@/lib/products"
import { ShoppingCart, Check, AlertCircle, ArrowRight, Package } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export function AddToCartButton({
  product,
  availableStock,
  selectedColor,
}: {
  product: Product
  availableStock?: number
  selectedColor?: string
}) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const router = useRouter()

  const stock = availableStock !== undefined ? availableStock : product.stock
  const isOutOfStock = stock === 0

  const handleAddToCart = () => {
    if (isOutOfStock) return

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "/placeholder.svg",
      color: selectedColor,
    })
    setAdded(true)
    setShowDialog(true)
  }

  const handleContinueShopping = () => {
    setShowDialog(false)
    setTimeout(() => setAdded(false), 300)
  }

  const handleGoToCheckout = () => {
    setShowDialog(false)
    router.push("/checkout")
  }

  if (isOutOfStock) {
    return (
      <Button size="lg" className="w-full md:w-auto px-8" disabled>
        <AlertCircle className="mr-2 h-5 w-5" />
        Niet op voorraad
      </Button>
    )
  }

  return (
    <>
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Product toegevoegd
            </DialogTitle>
            <DialogDescription>{product.name} is toegevoegd aan je winkelwagen</DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleContinueShopping} className="w-full sm:w-auto bg-transparent">
              <Package className="mr-2 h-4 w-4" />
              Verder winkelen
            </Button>
            <Button onClick={handleGoToCheckout} className="w-full sm:w-auto bg-primary hover:bg-primary-dark">
              Doorgaan naar afrekenen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
