import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-sans font-semibold text-foreground mb-8 text-balance">Over FORMD</h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed text-pretty">
            Wij vormen staal tot tijdloze designobjecten. Geïnspireerd door origami, gemaakt in Antwerpen.
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
                FORMD is ontstaan vanuit een fascinatie voor de Japanse kunst van het vouwen. We combineren deze
                traditie met moderne staalbewerking om unieke designobjecten te creëren. Elk product is een eerbetoon
                aan vakmanschap en duurzaamheid.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-sans font-semibold text-foreground mb-4">Onze Waarden</h2>
              <p className="text-muted-foreground leading-relaxed">
                Precisie, duurzaamheid en tijdloos design zijn de kern van FORMD. We werken met hoogwaardig staal en
                gebruiken innovatieve plooitechnieken om producten te maken die generaties lang meegaan. Lokale
                productie in Antwerpen staat centraal in onze werkwijze.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg p-8 md:p-12 border border-border">
            <h2 className="text-2xl font-sans font-semibold text-foreground mb-6">Ons Verhaal</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                FORMD is gevestigd in het hart van Antwerpen, waar ambachtelijke traditie en moderne innovatie
                samenkomen. Ons atelier combineert eeuwenoude plooitechnieken met hedendaagse staalbewerkingsmethoden.
              </p>
              <p>
                Geïnspireerd door origami - de Japanse kunst van het papier vouwen - passen we deze principes toe op
                staal. Het resultaat? Sterke, elegante objecten met geometrische lijnen die zowel functioneel als
                sculpturaal zijn.
              </p>
              <p>
                Elk FORMD product wordt lokaal vervaardigd met aandacht voor detail en kwaliteit. We geloven in duurzaam
                design dat de tand des tijds doorstaat, zowel in vorm als functie.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
