"use client"

import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccessPage() {
  const [loading, setLoading] = useState(true)
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
    setLoading(false)
  }, [clearCart])

  const handleNavigateToAccount = () => {
    window.location.href = "/account"
  }

  const handleNavigateToShop = () => {
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Bevestiging...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Betaling Geslaagd!</h1>
        <p className="text-muted-foreground mb-6">
          Bedankt voor je bestelling. Je ontvangt binnenkort een bevestigingsmail met de details.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={handleNavigateToAccount} className="w-full" size="lg">
            Bekijk Mijn Bestellingen
          </Button>
          <Button onClick={handleNavigateToShop} variant="outline" className="w-full bg-transparent" size="lg">
            Terug naar Shop
          </Button>
        </div>
      </Card>
    </div>
  )
}
