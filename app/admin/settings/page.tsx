"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { StandardColorsManagement } from "@/components/standard-colors-management"
import { CustomDesignSettingsManagement } from "@/components/custom-design-settings-management"
import { Switch } from "@/components/ui/switch"

interface InvoiceSettings {
  id: string
  company_name: string
  company_subtitle: string
  company_address: string
  company_vat: string | null
  company_phone: string | null
  company_email: string | null
  invoice_footer: string
  logo_url: string
  email_from_name: string
  email_from_address: string
  email_subject_customer: string
  email_subject_admin: string
  email_footer_text: string
  order_email_template: string
  shipping_email_template: string
  admin_email_template: string
  invoice_header_template: string
  invoice_footer_template: string
  order_email_subject: string
  shipping_email_subject: string
  admin_email_subject: string
  shipping_cost: number
  free_shipping_threshold: number
  shipping_description: string
  use_professional_template: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<InvoiceSettings | null>({
    company_name: "",
    company_subtitle: "",
    company_address: "",
    company_vat: "",
    company_email: "",
    company_phone: "",
    invoice_footer: "",
    email_from_name: "",
    email_from_address: "",
    email_subject_customer: "",
    email_subject_admin: "",
    email_footer_text: "",
    shipping_cost: 7.5,
    free_shipping_threshold: 75.0,
    shipping_description: "",
    order_email_template: "",
    shipping_email_template: "",
    admin_email_template: "",
    invoice_header_template: "",
    invoice_footer_template: "",
    order_email_subject: "",
    shipping_email_subject: "",
    admin_email_subject: "",
    use_professional_template: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [testEmail, setTestEmail] = useState("")
  const [sendingTest, setSendingTest] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [loadingDemoMode, setLoadingDemoMode] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
    loadDemoMode()
  }, [retryCount])

  async function loadSettings() {
    try {
      // Create a fresh Supabase client for this request
      const client = createBrowserClient()
      const { data, error} = await client
        .from("settings")
        .select("value")
        .eq("key", "invoice_settings")
        .maybeSingle()

      if (error) {
        throw error
      }
      
      // If settings exist, parse the JSON value
      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value)
          setSettings({ ...settings, ...parsed })
        } catch {
          // If parsing fails, keep default settings
          console.log("Using default invoice settings")
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      // Keep default settings if loading fails
    } finally {
      setLoading(false)
    }
  }

  async function loadDemoMode() {
    try {
      const response = await fetch("/api/demo-mode")
      const data = await response.json()
      setDemoMode(data.enabled)
    } catch (error) {
      console.error("Error loading demo mode:", error)
    } finally {
      setLoadingDemoMode(false)
    }
  }

  async function toggleDemoMode(enabled: boolean) {
    try {
      const response = await fetch("/api/admin/settings/demo-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      })

      const result = await response.json()
      if (result.success) {
        setDemoMode(enabled)
        toast({
          title: enabled ? "Demo Mode geactiveerd" : "Demo Mode gedeactiveerd",
          description: enabled
            ? "Bestellingen zijn nu geblokkeerd"
            : "Klanten kunnen nu weer bestellingen plaatsen",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error toggling demo mode:", error)
      toast({
        title: "Fout",
        description: "Kon demo mode niet wijzigen",
        variant: "destructive",
      })
    }
  }

  async function saveSettings() {
    if (!settings) return

    setSaving(true)
    try {
      // Create a fresh Supabase client for this request
      const supabase = createBrowserClient()
      
      // Save invoice settings as JSON in the settings table
      const { error } = await supabase.from("settings").upsert(
        {
          key: "invoice_settings",
          value: JSON.stringify(settings),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )

      if (error) throw error

      toast({
        title: "Opgeslagen",
        description: "Instellingen zijn bijgewerkt",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Fout",
        description: "Kon instellingen niet opslaan",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const sendTestEmail = async (type: "order_email" | "shipping_email" | "invoice") => {
    if (!testEmail) {
      alert("Voer een email adres in")
      return
    }

    setSendingTest(type)
    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: type,
          recipientEmail: testEmail,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert(`Test email verzonden naar ${testEmail}!`)
      } else {
        alert(`Fout bij verzenden: ${data.error}`)
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      alert("Fout bij verzenden van test email")
    } finally {
      setSendingTest(null)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <p>Laden{retryCount > 0 ? ` (poging ${retryCount + 1}/4)` : ""}...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>Instellingen niet gevonden</CardTitle>
              <CardDescription>
                De factuurinstellingen zijn nog niet beschikbaar. Dit kan gebeuren als de database net is aangemaakt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ververs de pagina over enkele seconden of wacht tot de database schema cache is bijgewerkt.
              </p>
              <Button onClick={() => window.location.reload()}>Pagina verversen</Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Instellingen</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demo Mode</CardTitle>
              <CardDescription>Schakel demo mode in om te voorkomen dat klanten echte bestellingen plaatsen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="demo-mode">Demo Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Wanneer actief worden bestellingen geblokkeerd en wordt er een banner getoond op de website
                  </p>
                </div>
                <Switch
                  id="demo-mode"
                  checked={demoMode}
                  onCheckedChange={toggleDemoMode}
                  disabled={loadingDemoMode}
                />
              </div>
              {demoMode && (
                <Alert className="mt-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
                  <AlertDescription className="text-orange-900 dark:text-orange-100">
                    Demo mode is actief. Klanten kunnen geen bestellingen plaatsen.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <StandardColorsManagement />

          <CustomDesignSettingsManagement />

          <Card>
            <CardHeader>
              <CardTitle>Verzendkosten instellingen</CardTitle>
              <CardDescription>Pas de verzendkosten en gratis verzending drempelwaarde aan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping_cost">Verzendkosten (€)</Label>
                  <Input
                    id="shipping_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.shipping_cost}
                    onChange={(e) => setSettings({ ...settings, shipping_cost: Number.parseFloat(e.target.value) })}
                  />
                  <p className="text-sm text-muted-foreground">
                    De standaard verzendkosten voor bestellingen onder de drempelwaarde
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="free_shipping_threshold">Gratis verzending vanaf (€)</Label>
                  <Input
                    id="free_shipping_threshold"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.free_shipping_threshold}
                    onChange={(e) =>
                      setSettings({ ...settings, free_shipping_threshold: Number.parseFloat(e.target.value) })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Bestellingen boven dit bedrag krijgen gratis verzending
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping_description">Verzending beschrijving</Label>
                <Input
                  id="shipping_description"
                  value={settings.shipping_description}
                  onChange={(e) => setSettings({ ...settings, shipping_description: e.target.value })}
                  placeholder="Levering binnen 3-5 werkdagen"
                />
                <p className="text-sm text-muted-foreground">
                  Deze tekst wordt weergegeven bij de verzendkosten in de winkelwagen
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Preview: Bij een bestelling van €50,00 worden €{settings.shipping_cost.toFixed(2)} verzendkosten
                  berekend. Bij €{settings.free_shipping_threshold.toFixed(2)} of meer is de verzending gratis.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Email & Factuur</CardTitle>
              <CardDescription>
                Verstuur test emails om te zien hoe ze eruit zien voordat je een echte bestelling plaatst
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="je@email.be"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => sendTestEmail("order_email")}
                  disabled={sendingTest === "order_email"}
                  variant="outline"
                >
                  {sendingTest === "order_email" ? "Verzenden..." : "Test Bestelling Ontvangen"}
                </Button>
                <Button
                  onClick={() => sendTestEmail("shipping_email")}
                  disabled={sendingTest === "shipping_email"}
                  variant="outline"
                >
                  {sendingTest === "shipping_email" ? "Verzenden..." : "Test Bestelling Verzonden"}
                </Button>
                <Button onClick={() => sendTestEmail("invoice")} disabled={sendingTest === "invoice"} variant="outline">
                  {sendingTest === "invoice" ? "Genereren..." : "Test Factuur"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Voer je email adres in en klik op een van de knoppen om een test email te ontvangen met voorbeeld data.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Button onClick={saveSettings} disabled={saving} size="lg">
            {saving ? "Opslaan..." : "Instellingen opslaan"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
