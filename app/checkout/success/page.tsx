"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCart } from "@/components/cart-provider"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")
  const [loading, setLoading] = useState(true)
  const { clearCart } = useCart()

  useEffect(() => {
    if (sessionId) {
      clearCart()
      setLoading(false)
    } else {
      // If no session_id, just show the success page
      setLoading(false)
    }
  }, [sessionId, clearCart])

  const handleViewOrders = () => {
    try {
      console.log("[v0] Navigating to account page")
      router.push("/account")
    } catch (error) {
      console.error("[v0] Error navigating to account:", error)
      window.location.href = "/account"
    }
  }

  const handleBackToShop = () => {
    try {
      console.log("[v0] Navigating to shop")
      router.push("/")
    } catch (error) {
      console.error("[v0] Error navigating to shop:", error)
      window.location.href = "/"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verifying payment...</p>
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
        <div className="flex flex-col gap-2">
          <Button onClick={handleViewOrders}>Bekijk Mijn Bestellingen</Button>
          <Button variant="outline" onClick={handleBackToShop}>
            Terug naar Shop
          </Button>
        </div>
      </Card>
    </div>
  )
}
