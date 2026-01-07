"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()
  const SHIPPING_COST = 7.5
  const FREE_SHIPPING_THRESHOLD = 75.0
  const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const finalTotal = totalPrice + shippingCost

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />

        {/* Empty Cart */}
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-sans font-semibold text-foreground mb-4">Uw winkelwagen is leeg</h1>
          <p className="text-muted-foreground mb-8">Ontdek onze collectie en voeg producten toe aan uw winkelwagen.</p>
          <Link href="/">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar Shop
            </Button>
          </Link>
        </div>

        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Cart Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Verder winkelen
          </Link>
        </div>

        <h1 className="text-4xl font-sans font-semibold text-foreground mb-12">Winkelwagen</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-6 pb-6 border-b border-border">
                <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                    <p className="text-foreground font-semibold">€{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Verminder aantal</span>
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Verhoog aantal</span>
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Verwijder item</span>
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">€{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-sans font-semibold text-foreground mb-6">Overzicht</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotaal</span>
                  <span className="text-foreground font-semibold">€{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Verzendkosten</span>
                  <span className="text-foreground font-semibold">
                    {shippingCost === 0 ? "Gratis" : `€${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {totalPrice < FREE_SHIPPING_THRESHOLD && (
                  <div className="text-xs text-muted-foreground">
                    Nog €{(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2)} tot gratis verzending
                  </div>
                )}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Totaal (incl. BTW)</span>
                    <span className="text-xl font-semibold text-foreground">€{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Link href="/checkout">
                <Button size="lg" className="w-full">
                  Naar Afrekenen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
