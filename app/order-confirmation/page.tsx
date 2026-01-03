import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CartButton } from "@/components/cart-button"
import { CheckCircle } from "lucide-react"

export default function OrderConfirmationPage() {
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
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Over Ons
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <CartButton />
        </div>
      </header>

      {/* Order Confirmation */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-serif font-semibold text-foreground mb-4">Bedankt voor uw bestelling!</h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Uw bestelling is succesvol geplaatst. U ontvangt binnen enkele minuten een bevestigingsmail met alle details
            en betaalinstructies.
          </p>
          <div className="bg-card border border-border rounded-lg p-8 mb-8 text-left">
            <h2 className="font-semibold text-foreground mb-4">Wat gebeurt er nu?</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-foreground font-semibold mt-0.5">1.</span>
                <span>U ontvangt een bevestigingsmail met uw ordernummer en betaalinstructies.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground font-semibold mt-0.5">2.</span>
                <span>Na ontvangst van uw betaling verwerken wij uw bestelling binnen 1 werkdag.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground font-semibold mt-0.5">3.</span>
                <span>Zodra uw bestelling is verzonden ontvangt u een track & trace code.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground font-semibold mt-0.5">4.</span>
                <span>Uw bestelling wordt binnen 3-5 werkdagen bij u thuis afgeleverd.</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="outline">
                Verder winkelen
              </Button>
            </Link>
            <Button size="lg" disabled>
              Track uw bestelling
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
