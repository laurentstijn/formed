"use client"

import type React from "react"
import { useCart } from "@/components/cart-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/client" // Import createClient here

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("België")
  const [createAccount, setCreateAccount] = useState(false)
  const [password, setPassword] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  })

  const SHIPPING_COST = 7.5
  const FREE_SHIPPING_THRESHOLD = 75.0
  const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const subtotal = totalPrice
  const finalTotal = subtotal + shippingCost

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const formDataFromForm = new FormData(e.currentTarget)
      const email = formDataFromForm.get("email") as string
      const firstName = formDataFromForm.get("firstName") as string
      const lastName = formDataFromForm.get("lastName") as string

      let accountCreated = false
      let authData = null // Declare authData here
      if (createAccount && password && password.length >= 6) {
        try {
          const supabase = createClient()

          const { data: authDataResponse, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
              data: {
                first_name: firstName,
                last_name: lastName,
              },
            },
          })

          if (authError) {
            console.log("[v0] Account creation failed, continuing as guest:", authError.message)
            // Don't show error to user, just continue as guest
          } else if (authDataResponse.user) {
            console.log("[v0] Account created successfully:", authDataResponse.user.id)
            accountCreated = true
            authData = authDataResponse // Assign authData here
          }
        } catch (error) {
          console.log("[v0] Error in account creation, continuing as guest:", error)
          // Don't block order if account creation fails
        }
      }

      const domain = typeof window !== "undefined" && window.location.hostname.includes("formd.be") ? "be" : "nl"

      const orderData = {
        email,
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone,
        address_line1: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        country: selectedCountry,
        auth_user_id: accountCreated && authData?.user ? authData.user.id : null, // Send auth user ID separately
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          color: item.color,
        })),
        total_amount: finalTotal,
        domain,
      }

      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to create order")
      }

      clearCart()
      router.push("/order-confirmation")
    } catch (error) {
      console.error("[v0] Error creating order:", error)
      alert("Er is iets misgegaan bij het plaatsen van je bestelling. Probeer het opnieuw.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />

        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-sans font-semibold text-foreground mb-4">Uw winkelwagen is leeg</h1>
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

        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

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

        <h1 className="text-4xl font-sans font-semibold text-foreground mb-12">Afrekenen</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-sans font-semibold text-foreground">Contactgegevens</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Voornaam</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Achternaam</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoonnummer</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="createAccount"
                        checked={createAccount}
                        onCheckedChange={(checked) => setCreateAccount(checked === true)}
                      />
                      <Label
                        htmlFor="createAccount"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Account aanmaken om bestellingen te volgen
                      </Label>
                    </div>
                    {createAccount && (
                      <div className="space-y-2 pl-6">
                        <Label htmlFor="password">Wachtwoord</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimaal 6 karakters"
                          minLength={6}
                          required={createAccount}
                        />
                        <p className="text-xs text-muted-foreground">
                          U ontvangt een bevestigingsmail om uw account te activeren.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-border">
                <h2 className="text-xl font-sans font-semibold text-foreground">Verzendadres</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Straat en huisnummer</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="postalCode">Postcode</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="city">Plaats</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Land</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger id="country" name="country">
                        <SelectValue placeholder="Selecteer een land" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="België">België</SelectItem>
                        <SelectItem value="Nederland">Nederland</SelectItem>
                        <SelectItem value="Duitsland">Duitsland</SelectItem>
                        <SelectItem value="Frankrijk">Frankrijk</SelectItem>
                        <SelectItem value="Luxemburg">Luxemburg</SelectItem>
                        <SelectItem value="Verenigd Koninkrijk">Verenigd Koninkrijk</SelectItem>
                        <SelectItem value="Spanje">Spanje</SelectItem>
                        <SelectItem value="Italië">Italië</SelectItem>
                        <SelectItem value="Portugal">Portugal</SelectItem>
                        <SelectItem value="Oostenrijk">Oostenrijk</SelectItem>
                        <SelectItem value="Zwitserland">Zwitserland</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-border">
                <h2 className="text-xl font-sans font-semibold text-foreground">Betaalmethode</h2>
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

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-sans font-semibold text-foreground mb-6">Overzicht bestelling</h2>
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
                  <span className="text-foreground font-semibold">€{subtotal.toFixed(2)}</span>
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
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Totaal (incl. BTW)</span>
                    <span className="text-xl font-semibold text-foreground">€{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
