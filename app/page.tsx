import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CartButton } from "@/components/cart-button"
import { ShareButtons } from "@/components/share-buttons"
import { products } from "@/lib/products"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/formed-primary.png" alt="FORMED" className="h-8 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-foreground font-medium transition-colors">
              Shop
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-4xl md:text-6xl font-sans font-semibold text-foreground mb-6 text-balance">
            formed in steel
          </h1>
          <p className="text-lg text-muted-foreground mb-8 text-pretty leading-relaxed">
            Ontdek onze zorgvuldig geselecteerde collectie van minimalistische woonaccessoires.
          </p>
          <Button size="lg" className="px-8">
            Ontdek de Collectie
          </Button>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-sans font-semibold text-foreground mb-12 text-center">Onze Collectie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group">
                <div className="bg-card rounded-lg overflow-hidden border border-border transition-all hover:shadow-lg">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{product.category}</p>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{product.name}</h3>
                    <p className="text-xl font-semibold text-foreground">€{product.price.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img src="/formed-secondary.png" alt="FORMED" className="h-16 w-auto mb-4" />
              
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
              <div className="mt-6">
                <ShareButtons
                  url="https://formed-webshop.vercel.app"
                  title="FORMED - Gevouwen Staal"
                  description="Gevouwen staal. Tijdloos design voor uw interieur."
                />
              </div>
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
