"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

import { Trash2, Plus } from "lucide-react"

export interface CustomMaterial {
  id: string
  name: string
  pricePerKg: number
}

export interface CustomDesignPricing {
  startCost: number
  cuttingPricePerMeter: number
  engravePricePerMeter: number
  powderCoatingSetup: number
  powderCoatingPerM2: number
  materials: CustomMaterial[]
}

const defaultPricing: CustomDesignPricing = {
  startCost: 25,
  cuttingPricePerMeter: 4.0,
  engravePricePerMeter: 2.0,
  powderCoatingSetup: 25.0,
  powderCoatingPerM2: 45.0,
  materials: [
    { id: 'inox', name: 'Geborsteld INOX', pricePerKg: 8.0 },
    { id: 'chroom', name: 'Polijst Chroom', pricePerKg: 10.0 },
    { id: 'messing', name: 'Goud / Messing', pricePerKg: 15.0 }
  ]
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
        const parsed = JSON.parse(data.value)
        if (!parsed.materials) {
           parsed.materials = [
             { id: 'inox', name: 'Geborsteld INOX', pricePerKg: parsed.pricePerKgInox ?? 8.0 },
             { id: 'chroom', name: 'Polijst Chroom', pricePerKg: parsed.pricePerKgChroom ?? 10.0 },
             { id: 'messing', name: 'Goud / Messing', pricePerKg: parsed.pricePerKgMessing ?? 15.0 }
           ]
        }
        if (parsed.powderCoatingSetup === undefined) parsed.powderCoatingSetup = 25.0;
        if (parsed.powderCoatingPerM2 === undefined) parsed.powderCoatingPerM2 = 45.0;
        setPricing({ ...defaultPricing, ...parsed })
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
            <h4 className="font-medium text-sm mb-4">Poedercoaten</h4>
          </div>

          <div className="space-y-2">
            <Label>Setupkost Poedercoaten (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={pricing.powderCoatingSetup}
              onChange={(e) => setPricing({ ...pricing, powderCoatingSetup: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Poedercoaten per m² (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={pricing.powderCoatingPerM2}
              onChange={(e) => setPricing({ ...pricing, powderCoatingPerM2: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="col-span-1 md:col-span-2 pt-4 border-t mt-2 flex justify-between items-center">
            <h4 className="font-medium text-sm">Materialen</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const id = 'mat_' + Date.now();
                setPricing({
                  ...pricing,
                  materials: [...(pricing.materials || []), { id, name: 'Nieuw Materiaal', pricePerKg: 10.0 }]
                })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Toevoegen
            </Button>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-4">
            {(pricing.materials || []).map((mat, index) => (
              <div key={mat.id} className="flex gap-4 items-end bg-zinc-50 p-4 rounded-md border border-zinc-200">
                <div className="flex-1 space-y-2">
                  <Label>Naam Materiaal</Label>
                  <Input
                    value={mat.name}
                    onChange={(e) => {
                      const newMats = [...pricing.materials];
                      newMats[index].name = e.target.value;
                      setPricing({ ...pricing, materials: newMats });
                    }}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Prijs (€/kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={mat.pricePerKg}
                    onChange={(e) => {
                      const newMats = [...pricing.materials];
                      newMats[index].pricePerKg = parseFloat(e.target.value) || 0;
                      setPricing({ ...pricing, materials: newMats });
                    }}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                  onClick={() => {
                    if (pricing.materials.length <= 1) {
                      toast({ title: "Fout", description: "Je moet minimaal één materiaal behouden", variant: "destructive" });
                      return;
                    }
                    setPricing({
                      ...pricing,
                      materials: pricing.materials.filter((_, i) => i !== index)
                    });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
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
