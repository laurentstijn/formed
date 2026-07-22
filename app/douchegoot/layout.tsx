import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Douchegoot Op Maat in RVS | FORMD",
  description:
    "Maatwerk douchegoten in roestvrij staal. Elke maat mogelijk, strakke afwerking, direct uit Antwerpen.",
}

export default function DouchegootLayout({ children }: { children: React.ReactNode }) {
  return children
}
