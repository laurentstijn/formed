import Link from "next/link"
import { ShareButtons } from "@/components/share-buttons"

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src="/formd-secondary.png" alt="FORMD" className="h-16 w-auto mb-4" />
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
              <li>info@formd.be</li>
            </ul>
            <div className="mt-6">
              <ShareButtons
                url="https://formd.be"
                title="FORMD - Gevouwen Staal"
                description="Gevouwen staal. Tijdloos design voor uw interieur."
              />
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 FORMD. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
