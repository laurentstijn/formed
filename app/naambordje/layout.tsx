import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Naambordje Op Maat in Staal of RVS | FORMD",
  description:
    "Gepersonaliseerde naambordjes in roestvrij staal, staal of messing. Lasergraveering met jouw naam, nummer of logo. Snel geleverd vanuit Antwerpen.",
}

export default function NaambordjeLayout({ children }: { children: React.ReactNode }) {
  return children
}
