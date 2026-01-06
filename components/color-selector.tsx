"use client"

import { useState } from "react"
import { Check } from "lucide-react"

interface ColorSelectorProps {
  colors: { name: string; hex: string; image?: string; stock?: number }[]
  onColorChange?: (colorIndex: number) => void
}

export function ColorSelector({ colors, onColorChange }: ColorSelectorProps) {
  const [selectedColor, setSelectedColor] = useState(0)

  const handleColorSelect = (index: number) => {
    setSelectedColor(index)
    onColorChange?.(index)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Kleur</h3>
      <div className="flex flex-wrap gap-3">
        {colors.map((color, index) => {
          const isOutOfStock = !color.stock || color.stock === 0

          return (
            <button key={index} onClick={() => handleColorSelect(index)} className="group relative" title={color.name}>
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColor === index
                      ? "border-foreground scale-110"
                      : "border-border hover:border-muted-foreground"
                  } ${isOutOfStock ? "opacity-50" : ""}`}
                  style={{ backgroundColor: color.hex }}
                >
                  {selectedColor === index && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white drop-shadow-lg" strokeWidth={3} />
                    </div>
                  )}
                </div>
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-0.5 bg-red-600 rotate-45 rounded-full" />
                  </div>
                )}
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {color.name} {isOutOfStock && "(Uitverkocht)"}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
