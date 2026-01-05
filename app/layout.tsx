import type React from "react"
import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/components/cart-provider"

const openSans = Open_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FORMD - formd in steel",
  description: "Gevouwen staal. Tijdloos design voor uw interieur",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "nl_BE",
    url: "https://formd.be",
    title: "FORMD - Gevouwen Staal",
    description: "Gevouwen staal. Tijdloos design voor uw interieur",
    siteName: "FORMD",
    images: [
      {
        url: "https://formd.be/og-image.png",
        width: 1200,
        height: 630,
        alt: "FORMD - formd in steel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORMD - Gevouwen Staal",
    description: "Gevouwen staal. Tijdloos design voor uw interieur",
    images: ["https://formd.be/og-image.png"],
  },
    generator: 'v0.app'
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
