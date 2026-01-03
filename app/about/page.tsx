import Link from "next/link"
import { CartButton } from "@/components/cart-button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/orife-logo.svg" alt="Orife" className="h-8 w-auto" />
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
          <h1 className="text-4xl md:text-6xl font-serif font-semibold text-foreground mb-8 text-balance">
            Over Studio
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed text-pretty">
            Wij geloven in de kracht van eenvoud en tijdloos design dat generaties lang meegaat.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Onze Visie</h2>
              <p className="text-muted-foreground leading-relaxed">
                Studio is ontstaan vanuit een passie voor minimalistische vormgeving en hoogwaardige materialen. We
                selecteren zorgvuldig elk product in onze collectie, waarbij kwaliteit en duurzaamheid altijd voorop
                staan.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Onze Waarden</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tijdloos design, eerlijke materialen en vakmanschap zijn de pijlers van onze filosofie. We werken samen
                met ambachtelijke makers en designers die onze visie delen op duurzaam en betekenisvol interieur.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg p-8 md:p-12 border border-border">
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">Ons Verhaal</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Studio begon in 2020 als een klein atelier in Amsterdam. Wat begon als een passieproject is uitgegroeid
                tot een gerespecteerde naam in de wereld van minimalistisch interieurdesign.
              </p>
              <p>
                Onze collectie wordt zorgvuldig samengesteld uit lokale en internationale ontwerpen. We geloven dat
                minder meer is, en dat elk object in uw huis een doel en betekenis moet hebben.
              </p>
              <p>
                Vandaag de dag werken we met een toegewijd team van design-liefhebbers die elke dag streven naar
                perfectie in service en productcuratie.
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
              <img src="/orife-logo.svg" alt="Orife" className="h-6 w-auto mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tijdloos design voor uw interieur. Kwaliteit en minimalisme in perfecte harmonie.
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
                <li>info@studio.nl</li>
                <li>+31 20 123 4567</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 Studio. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
