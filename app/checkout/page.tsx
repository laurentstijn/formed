"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CartButton } from "@/components/cart-button"
import { useCart } from "@/components/cart-provider"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    clearCart()
    router.push("/order-confirmation")
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-6 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img src="/orife-logo.svg" alt="Orife" className="h-8 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Shop
              </Link>
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Over Ons
              </Link>
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
            <CartButton />
          </div>
        </header>

        {/* Empty Cart */}
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-serif font-semibold text-foreground mb-4">Uw winkelwagen is leeg</h1>
          <p className="text-muted-foreground mb-8">
            Voeg eerst producten toe aan uw winkelwagen voordat u naar de checkout gaat.
          </p>
          <Link href="/">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar Shop
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/orife-logo.svg" alt="Orife" className="h-8 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Shop
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Over Ons
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <CartButton />
        </div>
      </header>

      {/* Checkout Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar winkelwagen
          </Link>
        </div>

        <h1 className="text-4xl font-serif font-semibold text-foreground mb-12">Afrekenen</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-semibold text-foreground">Contactgegevens</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Voornaam</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Achternaam</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoonnummer</Label>
                    <Input id="phone" name="phone" type="tel" required />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4 pt-8 border-t border-border">
                <h2 className="text-xl font-serif font-semibold text-foreground">Verzendadres</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Straat en huisnummer</Label>
                    <Input id="address" name="address" required />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="postalCode">Postcode</Label>
                      <Input id="postalCode" name="postalCode" required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="city">Plaats</Label>
                      <Input id="city" name="city" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Land</Label>
                    <Input id="country" name="country" defaultValue="Nederland" required />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4 pt-8 border-t border-border">
                <h2 className="text-xl font-serif font-semibold text-foreground">Betaalmethode</h2>
                <div className="bg-muted/50 border border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground">
                    Na het plaatsen van uw bestelling ontvangt u een e-mail met betaalinstructies. U kunt betalen via
                    iDEAL, creditcard of PayPal.
                  </p>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full md:w-auto px-12" disabled={isProcessing}>
                {isProcessing ? "Bestelling verwerken..." : "Bestelling plaatsen"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-serif font-semibold text-foreground mb-6">Overzicht bestelling</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Aantal: {item.quantity}</p>
                      <p className="text-sm font-semibold text-foreground mt-1">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotaal</span>
                  <span className="text-foreground font-semibold">€{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Verzendkosten</span>
                  <span className="text-foreground font-semibold">Gratis</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">BTW (21%)</span>
                  <span className="text-foreground font-semibold">€{(totalPrice * 0.21).toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Totaal</span>
                    <span className="text-xl font-semibold text-foreground">€{(totalPrice * 1.21).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
