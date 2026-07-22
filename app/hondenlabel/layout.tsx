import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hondenlabel Op Maat in RVS | FORMD",
  description:
    "Duurzame hondenlabels in roestvrij staal met lasergraveering. Naam, telefoonnummer of adres gegraveerd. Krasvast, waterproof, voor altijd.",
}

export default function HondenlabelLayout({ children }: { children: React.ReactNode }) {
  return children
}
