import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Mono, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/components/cart-provider"
import { Toaster } from "@/components/ui/toaster"
import { DemoModeBanner } from "@/components/demo-mode-banner"

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "FORMD - Formd in steel",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "nl_BE",
    url: "https://formd.be",
    title: "FORMD - Formd in steel",
    siteName: "FORMD",
    images: [
      {
        url: "/og-image.png?v=2",
        width: 1200,
        height: 630,
        alt: "FORMD - formd in steel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORMD - Formd in steel",
    images: ["/og-image.png?v=2"],
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
      <body className={`${ibmPlexMono.variable} ${inter.variable} font-mono antialiased uppercase tracking-wide`}>
        <CartProvider>
          <DemoModeBanner />
          {children}
        </CartProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
