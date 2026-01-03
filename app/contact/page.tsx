import Link from "next/link"
import { CartButton } from "@/components/cart-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
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
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Over Ons
            </Link>
            <Link href="/contact" className="text-sm text-foreground font-medium transition-colors">
              Contact
            </Link>
          </nav>
          <CartButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-semibold text-foreground mb-8 text-balance">
            Neem Contact Op
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
            Heeft u vragen over onze producten of wilt u meer weten over Studio? We helpen u graag verder.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-card rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">Stuur ons een bericht</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Naam
                  </label>
                  <Input id="name" placeholder="Uw naam" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    E-mail
                  </label>
                  <Input id="email" type="email" placeholder="uw@email.nl" required />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Onderwerp
                  </label>
                  <Input id="subject" placeholder="Waar gaat uw bericht over?" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Bericht
                  </label>
                  <Textarea id="message" placeholder="Uw bericht..." rows={6} required />
                </div>
                <Button type="submit" className="w-full">
                  Verstuur Bericht
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-4">Bezoekadres</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Prinsengracht 263
                  <br />
                  1016 GV Amsterdam
                  <br />
                  Nederland
                </p>
              </div>

              <div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-4">Contactgegevens</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">E-mail:</span> info@studio.nl
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Telefoon:</span> +31 20 123 4567
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-4">Openingstijden</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Maandag - Vrijdag</span>
                    <span>10:00 - 18:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Zaterdag</span>
                    <span>11:00 - 17:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Zondag</span>
                    <span>Gesloten</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">Klantenservice</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ons team staat klaar om al uw vragen te beantwoorden. We streven ernaar om binnen 24 uur te reageren
                  op alle berichten.
                </p>
              </div>
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
