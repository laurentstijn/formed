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
    // Clear cart after successful payment
    if (sessionId) {
      clearCart()
      setLoading(false)
    }
  }, [sessionId, clearCart])

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
          <Button onClick={() => router.push("/account")}>Bekijk Mijn Bestellingen</Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Terug naar Shop
          </Button>
        </div>
      </Card>
    </div>
  )
}
