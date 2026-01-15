"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save } from "lucide-react"

interface StandardColor {
  name: string
  hex: string
  ral?: string
  rgb?: string
}

export function StandardColorsManagement() {
  const [colors, setColors] = useState<StandardColor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadColors()
  }, [])

  const loadColors = async () => {
    try {
      const response = await fetch("/api/admin/settings/standard-colors")
      const data = await response.json()
      setColors(data.colors || [])
    } catch (error) {
      console.error("Failed to load colors:", error)
    } finally {
      setLoading(false)
    }
  }

  const addColor = () => {
    setColors([...colors, { name: "", hex: "#000000" }])
  }

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index))
  }

  const updateColor = (index: number, field: keyof StandardColor, value: string) => {
    const updated = [...colors]
    updated[index] = { ...updated[index], [field]: value }
    setColors(updated)
  }

  const saveColors = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings/standard-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colors }),
      })

      if (response.ok) {
        alert("Standaard kleuren opgeslagen!")
      } else {
        alert("Fout bij opslaan")
      }
    } catch (error) {
      console.error("Failed to save colors:", error)
      alert("Fout bij opslaan")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Laden...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Standaard Kleuren Beheren</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {colors.map((color, index) => (
          <div key={index} className="flex items-end gap-2 p-4 border rounded-lg">
            <div
              className="w-12 h-12 rounded border-2 border-gray-300 flex-shrink-0"
              style={{ backgroundColor: color.hex }}
            />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div>
                <Label>Naam</Label>
                <Input
                  value={color.name}
                  onChange={(e) => updateColor(index, "name", e.target.value)}
                  placeholder="Bijv. Mint green"
                />
              </div>
              <div>
                <Label>Hex Code</Label>
                <Input
                  value={color.hex}
                  onChange={(e) => updateColor(index, "hex", e.target.value)}
                  placeholder="#000000"
                />
              </div>
              <div>
                <Label>RAL (optioneel)</Label>
                <Input
                  value={color.ral || ""}
                  onChange={(e) => updateColor(index, "ral", e.target.value)}
                  placeholder="6019"
                />
              </div>
              <div>
                <Label>RGB (optioneel)</Label>
                <Input
                  value={color.rgb || ""}
                  onChange={(e) => updateColor(index, "rgb", e.target.value)}
                  placeholder="163, 205, 175"
                />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeColor(index)} className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex gap-2">
          <Button onClick={addColor} variant="outline" className="flex-1 bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Kleur Toevoegen
          </Button>
          <Button onClick={saveColors} disabled={saving} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
