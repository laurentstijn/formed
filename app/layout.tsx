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
  title: "FORMD | Metalen Accessoires & Laser Op Maat — Antwerpen",
  description: "Koop strakke metalen woonaccessoires of upload je eigen DXF voor lasersnijden op maat. Staal, RVS, messing en aluminium. Snel geleverd vanuit Antwerpen.",
  keywords: ["DXF laseren", "staal op maat", "RVS snijden", "metaalbewerking", "poedercoaten", "aluminium laseren", "metaal graveren", "FORMD"],
  authors: [{ name: "FORMD" }],
  creator: "FORMD",
  publisher: "FORMD",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "nl_BE",
    url: "https://formd.be",
    title: "FORMD | DXF Laseren & Plaatwerk Op Maat",
    description: "Upload je DXF bestand en zie direct de prijs. Wij snijden en poedercoaten metaal op maat.",
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
    title: "FORMD | Staal & RVS Op Maat",
    description: "Upload je DXF en bestel direct online. Snel, simpel en op maat.",
    images: ["/og-image.png?v=2"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  generator: 'Next.js'
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
