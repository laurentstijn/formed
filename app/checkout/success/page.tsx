"use client"

import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useCart } from "@/components/cart-provider"

export default function CheckoutSuccessPage() {
  const [loading, setLoading] = useState(true)
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
    setLoading(false)
  }, [clearCart])

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
          <a
            href="/account"
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors text-center block"
          >
            Bekijk Mijn Bestellingen
          </a>
          <a
            href="/"
            className="w-full px-4 py-3 bg-transparent border border-input rounded-md font-medium hover:bg-accent hover:text-accent-foreground transition-colors text-center block"
          >
            Terug naar Shop
          </a>
        </div>
      </Card>
    </div>
  )
}
