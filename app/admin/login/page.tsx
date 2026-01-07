"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("[v0] Starting admin login for:", email)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      console.log("[v0] Login API response:", data)

      if (!response.ok) {
        setError(data.error || "Login failed")
        setLoading(false)
        return
      }

      console.log("[v0] Login successful, redirecting to /admin")
      window.location.replace("/admin")
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("Er ging iets mis bij het inloggen")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">FORMD Admin</h1>
          <p className="text-gray-600 mt-2">Log in met je admin email</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="laurensstijn@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Inloggen..." : "Inloggen"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-gray-500 text-center">Alleen geautoriseerde admins hebben toegang</p>
      </div>
    </div>
  )
}
