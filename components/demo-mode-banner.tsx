"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function DemoModeBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false)

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

  if (!isDemoMode) return null

  return (
    <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-900 dark:text-orange-100">
        <strong>Demo Mode:</strong> Deze website is momenteel in demo modus. Bestellingen zijn uitgeschakeld.
      </AlertDescription>
    </Alert>
  )
}
