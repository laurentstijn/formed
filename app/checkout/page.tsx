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
import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { DemoModeBanner } from "@/components/demo-mode-banner"
import { createClient } from "@/lib/supabase/client"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("België")
  const [createAccount, setCreateAccount] = useState(false)
  const [password, setPassword] = useState("")
  const [emailExists, setEmailExists] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [stripeCheckoutUrl, setStripeCheckoutUrl] = useState<string | null>(null)
  const [isLoadingUserData, setIsLoadingUserData] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  })

  useEffect(() => {
    async function checkDemoMode() {
      try {
        const response = await fetch("/api/demo-mode")
        const data = await response.json()
        setIsDemoMode(data.enabled)
      } catch (error) {
        console.error("Failed to check demo mode:", error)
      }
    }
    checkDemoMode()
  }, [])

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        console.log("[v0] Checking for logged-in user:", user?.email)

        if (user) {
          // Try to get customer data from database
          const { data: customer, error } = await supabase.from("customers").select("*").eq("user_id", user.id).single()

          console.log("[v0] Customer data from database:", customer)

          if (customer && !error) {
            // Fill form with customer data
            setFormData({
              firstName: customer.first_name || "",
              lastName: customer.last_name || "",
              email: customer.email || user.email || "",
              phone: customer.phone || "",
              address: customer.address_line1 || "",
              city: customer.city || "",
              postalCode: customer.postal_code || "",
            })
            console.log("[v0] Form pre-filled with customer data")
          } else {
            // No customer record yet, use auth metadata
            const metadata = user.user_metadata
            setFormData({
              firstName: metadata?.first_name || "",
              lastName: metadata?.last_name || "",
              email: user.email || "",
              phone: "",
              address: "",
              city: "",
              postalCode: "",
            })
            console.log("[v0] Form pre-filled with auth metadata")
          }

          setEmailExists(true)
          setCreateAccount(false)
        }
      } catch (error) {
        console.error("[v0] Error loading user data:", error)
      } finally {
        setIsLoadingUserData(false)
      }
    }

    loadUserData()
  }, [])

  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes("@")) {
      setEmailExists(false)
      return
    }

    setIsCheckingEmail(true)
    try {
      const response = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      })

      const result = await response.json()

      if (result.exists) {
        setEmailExists(true)
        setCreateAccount(false)
      } else {
        setEmailExists(false)
      }
    } catch (error) {
      setEmailExists(false)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  useEffect(() => {
    if (formData.email && formData.email.includes("@") && formData.email.includes(".")) {
      const timeoutId = setTimeout(() => {
        checkEmailAvailability(formData.email)
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [formData.email])

  const SHIPPING_COST = 7.5
  const FREE_SHIPPING_THRESHOLD = 75.0
  const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const subtotal = totalPrice
  const finalTotal = subtotal + shippingCost

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("[v0] Checkout form submitted")

    if (isDemoMode) {
      alert("Demo Mode: Bestellingen zijn momenteel uitgeschakeld. Deze website is in demo modus.")
      return
    }

    setIsProcessing(true)

    try {
      const formDataFromForm = new FormData(e.currentTarget)
      const email = formDataFromForm.get("email") as string
      const firstName = formDataFromForm.get("firstName") as string
      const lastName = formDataFromForm.get("lastName") as string

      console.log("[v0] Form data collected:", { email, firstName, lastName })

      let accountCreated = false
      let authData = null

      if (createAccount && password && password.length >= 6) {
        console.log("[v0] Creating account...")
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
            console.log("[v0] Auth error:", authError)
            if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
              alert(
                "Dit e-mailadres is al in gebruik. Log eerst in om je bestelling te koppelen aan je account, of ga door als gast.",
              )
              setIsProcessing(false)
              return
            }
          } else if (authDataResponse.user) {
            accountCreated = true
            authData = authDataResponse
            console.log("[v0] Account created successfully")
          }
        } catch (error) {
          console.log("[v0] Account creation error:", error)
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
        auth_user_id: accountCreated && authData?.user ? authData.user.id : null,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          color: item.color,
        })),
        total_amount: finalTotal,
        shipping_cost: shippingCost,
        domain,
      }

      console.log("[v0] Creating order in database...")
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const orderResult = await orderResponse.json()
      console.log("[v0] Order creation response:", orderResult)

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create order")
      }

      const orderId = orderResult.order.id
      console.log("[v0] Order created with ID:", orderId)

      console.log("[v0] Creating Stripe checkout session...")
      const stripeResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            color: item.color,
          })),
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          shippingCost: shippingCost,
          orderId: orderId,
        }),
      })

      const stripeResult = await stripeResponse.json()
      console.log("[v0] Stripe checkout session response:", stripeResult)

      if (stripeResult.url) {
        console.log("[v0] Redirecting to Stripe checkout:", stripeResult.url)
        clearCart()

        window.location.href = stripeResult.url
      } else {
        throw new Error("No checkout URL received from Stripe")
      }
    } catch (error) {
      console.error("[v0] Error in checkout process:", error)
      alert("Er is iets misgegaan bij het plaatsen van je bestelling. Probeer het opnieuw.")
      setIsProcessing(false)
      setStripeCheckoutUrl(null)
    }
  }

  if (stripeCheckoutUrl) {
    return null
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
        <DemoModeBanner />
        
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
                      onBlur={(e) => checkEmailAvailability(e.target.value)}
                      required
                    />
                    {emailExists && (
                      <p className="text-sm text-muted-foreground">
                        Dit e-mailadres is bij ons bekend.{" "}
                        <Link href="/account/login" className="text-primary hover:underline">
                          Log in
                        </Link>{" "}
                        om uw gegevens automatisch in te vullen.
                      </p>
                    )}
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
                  {!emailExists && !isCheckingEmail && formData.email.includes("@") && (
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
                  )}
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
                  <div className="flex items-center gap-3">
                    <svg className="h-6" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z"
                        fill="#635BFF"
                      />
                    </svg>
                    <p className="text-sm text-muted-foreground">
                      Beveiligde betaling met Stripe. U kunt betalen met Bancontact, creditcard of andere
                      betaalmethodes.
                    </p>
                  </div>
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
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.name}
                        {item.color && <span className="text-muted-foreground font-normal"> - {item.color}</span>}
                      </p>
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
