"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { SiteHeader } from "@/components/site-header"

export default function CustomerLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/account/reset-password`,
        })

        if (error) throw error

        setSuccessMessage("Er is een wachtwoord reset link naar je email gestuurd!")
        setIsForgotPassword(false)
        setIsLoading(false)
        return
      }

      if (isSignUp) {
        console.log("[v0] === REGISTRATIE GESTART ===")
        console.log("[v0] Email:", email)
        console.log("[v0] Voornaam:", firstName)
        console.log("[v0] Achternaam:", lastName)
        console.log("[v0] Metadata die naar Supabase gaat:", {
          is_customer: true,
          first_name: firstName,
          last_name: lastName,
        })

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}`,
            data: {
              is_customer: true,
              first_name: firstName,
              last_name: lastName,
            },
          },
        })

        if (error) {
          console.log("[v0] FOUT bij registratie:", error)
          throw error
        }

        console.log("[v0] Supabase auth.signUp geslaagd!")
        console.log("[v0] Nieuwe user data:", data.user)
        console.log("[v0] User metadata:", data.user?.user_metadata)
        console.log("[v0] User ID:", data.user?.id)
        console.log("[v0] === Nu zou de database trigger moeten draaien om customer record aan te maken ===")

        setTimeout(async () => {
          const { data: customerData, error: customerError } = await supabase
            .from("customers")
            .select("*")
            .eq("email", email)
            .single()

          console.log("[v0] Customer record check:")
          if (customerError) {
            console.log("[v0] FOUT bij ophalen customer:", customerError)
          } else {
            console.log("[v0] Customer record gevonden:", customerData)
          }
        }, 2000)

        setSuccessMessage("Account aangemaakt! Je kunt nu inloggen.")
        setIsSignUp(false)
        setPassword("")
        setFirstName("")
        setLastName("")
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: adminData } = await supabase.from("admins").select("*").eq("id", user.id).single()
        localStorage.setItem("isAdmin", adminData ? "true" : "false")
      }

      window.location.href = redirectTo
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      if (error.message === "Email not confirmed") {
        setError("Email nog niet bevestigd. Check je inbox voor de bevestigingslink.")
      } else {
        setError(error.message || "Er is een fout opgetreden")
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="flex items-center justify-center p-4 py-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-sans">
              {isForgotPassword ? "Wachtwoord Vergeten" : isSignUp ? "Account Aanmaken" : "Inloggen"}
            </CardTitle>
            <CardDescription>
              {isForgotPassword
                ? "Voer je email in om een wachtwoord reset link te ontvangen"
                : isSignUp
                  ? "Maak een account aan om je bestellingen te volgen"
                  : "Log in om je bestellingen te bekijken"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Voornaam</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Voornaam"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Achternaam</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Achternaam"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jouw@email.nl"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}
              {successMessage && (
                <p className="text-sm text-center text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>
              )}
              {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? "Bezig..."
                  : isForgotPassword
                    ? "Reset Link Versturen"
                    : isSignUp
                      ? "Registreren"
                      : "Inloggen"}
              </Button>
              <div className="space-y-2">
                {!isForgotPassword && !isSignUp && (
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true)
                        setError(null)
                        setSuccessMessage(null)
                      }}
                      className="text-muted-foreground hover:text-primary hover:underline"
                    >
                      Wachtwoord vergeten?
                    </button>
                  </div>
                )}
                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      if (isForgotPassword) {
                        setIsForgotPassword(false)
                      } else {
                        setIsSignUp(!isSignUp)
                      }
                      setError(null)
                      setSuccessMessage(null)
                    }}
                    className="text-primary hover:underline"
                  >
                    {isForgotPassword
                      ? "Terug naar inloggen"
                      : isSignUp
                        ? "Al een account? Log in"
                        : "Nog geen account? Registreer"}
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
