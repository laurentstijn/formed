"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/components/cart-provider"
import type { Product } from "@/lib/products"
import type { ProductVariant } from "@/lib/supabase/variants"
import { ShoppingCart, Check, ArrowRight, Package, Bell } from "lucide-react"
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
  selectedVariant,
}: {
  product: Product
  availableStock?: number
  selectedColor?: string
  selectedVariant?: ProductVariant | null
}) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState("")
  const [notifyStatus, setNotifyStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const router = useRouter()

  const stock = availableStock !== undefined ? availableStock : product.stock
  const isOutOfStock = stock === 0

  const handleAddToCart = () => {
    if (isOutOfStock) return

    addItem({
      id: product.id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      image: selectedVariant?.image_url || product.image || "/placeholder.svg",
      color: selectedColor,
      variant_id: selectedVariant?.id,
      variant_name: selectedVariant?.name,
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

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (notifyStatus === "submitting") return
    setNotifyStatus("submitting")
    try {
      const response = await fetch("/api/stock-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, email: notifyEmail }),
      })
      if (!response.ok) throw new Error("Inschrijven mislukt")
      setNotifyStatus("success")
    } catch {
      setNotifyStatus("error")
    }
  }

  if (isOutOfStock) {
    if (notifyStatus === "success") {
      return (
        <p className="w-full md:w-auto text-sm text-muted-foreground flex items-center gap-2">
          <Check className="h-4 w-4" />
          Bedankt! We laten je weten zodra dit product terug beschikbaar is.
        </p>
      )
    }

    return (
      <form onSubmit={handleNotifySubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          required
          placeholder="jouw@email.be"
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
          className="sm:w-64"
        />
        <Button type="submit" size="lg" className="px-8 shrink-0" disabled={notifyStatus === "submitting"}>
          <Bell className="mr-2 h-5 w-5" />
          {notifyStatus === "submitting" ? "Bezig..." : "Verwittig mij"}
        </Button>
        {notifyStatus === "error" && (
          <p className="text-sm text-destructive sm:self-center">Er ging iets mis, probeer opnieuw.</p>
        )}
      </form>
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
            <DialogDescription>
              {product.name}
              {selectedVariant && ` (${selectedVariant.name})`} is toegevoegd aan je winkelwagen
            </DialogDescription>
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
