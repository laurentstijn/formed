import Link from "next/link"
import { CartButton } from "@/components/cart-button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/formed-primary.png" alt="FORMED" className="h-8 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Shop
            </Link>
            <Link href="/about" className="text-sm text-foreground font-medium transition-colors">
              Over Ons
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <CartButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-sans font-semibold text-foreground mb-8 text-balance">
            Over FORMED
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed text-pretty">
            Wij vormgeven staal tot tijdloze designobjecten. Geïnspireerd door origami, gemaakt in Antwerpen.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-sans font-semibold text-foreground mb-4">Onze Visie</h2>
              <p className="text-muted-foreground leading-relaxed">
                FORMED is ontstaan vanuit een fascinatie voor de Japanse kunst van het vouwen. We combineren deze
                traditie met moderne staalbewerking om unieke designobjecten te creëren. Elk product is een eerbetoon
                aan vakmanschap en duurzaamheid.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-sans font-semibold text-foreground mb-4">Onze Waarden</h2>
              <p className="text-muted-foreground leading-relaxed">
                Precisie, duurzaamheid en tijdloos design zijn de kern van FORMED. We werken met hoogwaardig staal en
                gebruiken innovatieve plooitechnieken om producten te maken die generaties lang meegaan. Lokale
                productie in Antwerpen staat centraal in onze werkwijze.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg p-8 md:p-12 border border-border">
            <h2 className="text-2xl font-sans font-semibold text-foreground mb-6">Ons Verhaal</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                FORMED is gevestigd in het hart van Antwerpen, waar ambachtelijke traditie en moderne innovatie
                samenkomen. Ons atelier combineert eeuwenoude plooitechnieken met hedendaagse staalbewerkingsmethoden.
              </p>
              <p>
                Geïnspireerd door origami - de Japanse kunst van het papier vouwen - passen we deze principes toe op
                staal. Het resultaat? Sterke, elegante objecten met geometrische lijnen die zowel functioneel als
                sculpturaal zijn.
              </p>
              <p>
                Elk FORMED product wordt lokaal vervaardigd met aandacht voor detail en kwaliteit. We geloven in
                duurzaam design dat de tand des tijds doorstaat, zowel in vorm als functie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img src="/formed-secondary.png" alt="FORMED" className="h-16 w-auto mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gevouwen staal. Tijdloos design voor uw interieur.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    Over Ons
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>info@formed.be</li>
                <li>+32 477 655 655</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 FORMED. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
