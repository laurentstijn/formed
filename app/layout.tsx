import type React from "react"
import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/components/cart-provider"

const openSans = Open_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FORMED - Gevouwen Staal",
  description: "Gevouwen staal. Tijdloos design voor uw interieur",
  generator: "v0.app",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl">
      <body className={`${openSans.className} antialiased`}>
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
