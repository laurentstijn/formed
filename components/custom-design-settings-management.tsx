"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface CustomDesignPricing {
  startCost: number
  pricePerKgInox: number
  pricePerKgChroom: number
  pricePerKgMessing: number
  cuttingPricePerMeter: number
  engravePricePerMeter: number
}

const defaultPricing: CustomDesignPricing = {
  startCost: 25,
  pricePerKgInox: 8.0,
  pricePerKgChroom: 10.0,
  pricePerKgMessing: 15.0,
  cuttingPricePerMeter: 4.0,
  engravePricePerMeter: 2.0,
}

export function CustomDesignSettingsManagement() {
  const [pricing, setPricing] = useState<CustomDesignPricing>(defaultPricing)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadPricing()
  }, [])

  async function loadPricing() {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "custom_design_settings")
        .maybeSingle()

      if (error) throw error
      if (data?.value) {
        setPricing({ ...defaultPricing, ...JSON.parse(data.value) })
      }
    } catch (error) {
      console.error("Error loading custom design settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function savePricing() {
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.from("settings").upsert(
        {
          key: "custom_design_settings",
          value: JSON.stringify(pricing),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )

      if (error) throw error

      toast({
        title: "Opgeslagen",
        description: "Eigen Ontwerp prijzen zijn bijgewerkt",
      })
    } catch (error) {
      console.error("Error saving custom design settings:", error)
      toast({
        title: "Fout",
        description: "Kon prijzen niet opslaan",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-4 border rounded animate-pulse bg-muted/50 h-[300px]" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eigen Ontwerp Prijzen</CardTitle>
        <CardDescription>
          Beheer de prijzen voor de 2D DXF calculator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Opstartkosten (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={pricing.startCost}
              onChange={(e) => setPricing({ ...pricing, startCost: parseFloat(e.target.value) || 0 })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Snijden per meter (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={pricing.cuttingPricePerMeter}
              onChange={(e) => setPricing({ ...pricing, cuttingPricePerMeter: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Graveren per meter (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={pricing.engravePricePerMeter}
              onChange={(e) => setPricing({ ...pricing, engravePricePerMeter: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="col-span-1 md:col-span-2 pt-4 border-t mt-2">
            <h4 className="font-medium text-sm mb-4">Materiaalkosten per kg</h4>
          </div>

          <div className="space-y-2">
            <Label>Geborsteld INOX (€/kg)</Label>
            <Input
              type="number"
              step="0.01"
              value={pricing.pricePerKgInox}
              onChange={(e) => setPricing({ ...pricing, pricePerKgInox: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Spiegel Chroom (€/kg)</Label>
            <Input
              type="number"
              step="0.01"
              value={pricing.pricePerKgChroom}
              onChange={(e) => setPricing({ ...pricing, pricePerKgChroom: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Goud / Messing (€/kg)</Label>
            <Input
              type="number"
              step="0.01"
              value={pricing.pricePerKgMessing}
              onChange={(e) => setPricing({ ...pricing, pricePerKgMessing: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={savePricing} disabled={saving}>
            {saving ? "Opslaan..." : "Prijzen Opslaan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
