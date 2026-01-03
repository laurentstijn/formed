export type Product = {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  features: string[]
  materials: string
  dimensions: string
}

export const products: Product[] = [
  {
    id: 1,
    name: "Minimalist Vase",
    price: 49.99,
    image: "/curved-metal-stand-mint.png",
    category: "Decoration",
    description:
      "Een elegante handgemaakte vaas die tijdloze schoonheid combineert met functioneel design. Perfect voor verse bloemen of als zelfstandig decoratief element.",
    features: ["Handgemaakt keramiek", "Waterdicht geglazuurd", "Stabiele basis", "Veelzijdig te stylen"],
    materials: "Hoogwaardig wit keramiek met matte afwerking",
    dimensions: "H: 25cm, Ø: 12cm",
  },
  {
    id: 2,
    name: "Ceramic Bowl Set (Casa)",
    price: 54.99,
    image: "/white-ceramic-bowl-set-minimal.jpg",
    category: "Kitchenware",
    description:
      "Een set van drie handgemaakte keramische kommen in verschillende maten. Perfect voor serveren en decoratie.",
    features: ["Set van 3 kommen", "Vaatwasserbestendig", "Magnetronbestendig", "Handgemaakt"],
    materials: "Wit keramiek met glanzende glazuur",
    dimensions: "Klein: Ø 12cm, Medium: Ø 16cm, Groot: Ø 20cm",
  },
  {
    id: 3,
    name: "Oak Coffee Table",
    price: 299.99,
    image: "/minimalist-oak-wood-coffee-table.jpg",
    category: "Furniture",
    description:
      "Een prachtige salontafel vervaardigd uit massief eikenhout. Het minimalistische ontwerp past perfect in moderne woonruimtes.",
    features: ["Massief eikenhout", "Natuurlijke oliebehandeling", "Duurzaam geproduceerd", "Handafgewerkt"],
    materials: "100% massief Europees eikenhout",
    dimensions: "H: 40cm, B: 120cm, D: 60cm",
  },
  {
    id: 4,
    name: "Linen Cushion",
    price: 24.99,
    image: "/beige-linen-cushion-minimalist.jpg",
    category: "Textile",
    description: "Een luxe linnen kussen dat comfort en stijl combineert. De natuurlijke kleur past bij elk interieur.",
    features: ["100% Europees linnen", "Afneembare hoes", "Verborgen rits", "Inclusief vulling"],
    materials: "Natuurlijk linnen met polyester vulling",
    dimensions: "45cm x 45cm",
  },
  {
    id: 5,
    name: "Glass Pendant Light",
    price: 89.99,
    image: "/minimalist-glass-pendant-light.jpg",
    category: "Lighting",
    description:
      "Een elegante hanglamp van mondgeblazen glas. Creëert sfeervolle verlichting boven eettafels of in woonruimtes.",
    features: ["Mondgeblazen glas", "E27 fitting", "Verstelbare hoogte", "Designkabel"],
    materials: "Helder glas met messing ophanging",
    dimensions: "H: 20cm, Ø: 25cm, kabellengte: 150cm",
  },
  {
    id: 6,
    name: "Geometric Planter",
    price: 34.99,
    image: "/geometric-concrete-planter.jpg",
    category: "Decoration",
    description:
      "Een moderne plantenbak met geometrische vorm, gegoten in duurzaam beton. Brengt een industriële touch aan elk interieur.",
    features: ["Gegoten beton", "Drainage gat", "Geschikt voor binnen en buiten", "Uniek design"],
    materials: "Grijs beton met gesealde afwerking",
    dimensions: "H: 15cm, B: 18cm, D: 18cm",
  },
]

export function getProductById(id: number): Product | undefined {
  return products.find((product) => product.id === id)
}
