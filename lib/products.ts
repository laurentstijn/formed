export type Product = {
  id: number
  name: string
  price: number
  image: string
  technicalDrawing?: string
  category: string
  description: string
  features: string[]
  materials: string
  dimensions: string
  colors?: {
    name: string
    hex: string
    images: string[] // Foto's specifiek voor deze kleur
  }[]
}

export const products: Product[] = [
  {
    id: 1,
    name: "Cactus Wandhaakje",
    price: 49.99,
    image: "/products/cactus.png",
    technicalDrawing: "/products/technical/cactus-technical.svg",
    colors: [
      {
        name: "Koper Rosé",
        hex: "#B87333",
        images: [
          "/products/cactus.png",
          "/products/cactus-detail-1.jpg",
          "/products/cactus-side.jpg",
          "/products/cactus-lifestyle.jpg",
        ],
      },
      {
        name: "Zwart Mat",
        hex: "#2C2C2C",
        images: [
          "/products/cactus.png", // Placeholder - vervang met zwarte variant
          "/products/cactus-detail-1.jpg",
        ],
      },
      {
        name: "Wit",
        hex: "#F5F5F5",
        images: [
          "/products/cactus.png", // Placeholder - vervang met witte variant
        ],
      },
      {
        name: "Grijs",
        hex: "#808080",
        images: [
          "/products/cactus.png", // Placeholder - vervang met grijze variant
        ],
      },
      {
        name: "Goud",
        hex: "#D4AF37",
        images: [
          "/products/cactus.png", // Placeholder - vervang met gouden variant
        ],
      },
    ],
    category: "Decoration",
    description: "Een elegante haakje dat tijdloze schoonheid combineert met functioneel design.",
    features: ["Handgemaakt sheetmetal", "poedercoat"],
    materials: "Hoogwaardig alluminium",
    dimensions: "H: 25cm, Ø: 12cm",
  },
  {
    id: 2,
    name: "Klein Wandhaakje",
    price: 24.99,
    image: "/products/haakje.png",
    category: "Decoration",
    description: "Een klein haakje om een jas/ handdoek aan te hangen. Perfect in elk interieur.",
    features: ["Minimalistisch haakje", "Perfect voor elk interieur", "Handgemaakt"],
    materials: "alluminium",
    dimensions: "Klein: Ø 12cm, Medium: Ø 16cm, Groot: Ø 20cm",
  },
  {
    id: 3,
    name: "Elegant dienblad",
    price: 119.99,
    image: "/products/dienblad.png",
    category: "Decoration",
    description:
      "Een prachtige dienblad dat op elke salontafel past. Het minimalistische ontwerp past perfect in moderne woonruimtes.",
    features: ["Handgemaakt sheetmetal", "poedercoat"],
    materials: "Hoogwaardig alluminium",
    dimensions: "H: 40cm, B: 120cm, D: 60cm",
  },
  {
    id: 4,
    name: "Badkamer handdoek rekje",
    price: 149.99,
    image: "/products/handdoek.png",
    category: "Decoration",
    description: "Een luxe handdoek rekje. De natuurlijke kleur past bij elk interieur.",
    features: ["Handgemaakt sheetmetal", "natural"],
    materials: "Hoogwaardig alluminium",
    dimensions: "45cm x 45cm",
  },
  {
    id: 5,
    name: "Boot Haakje",
    price: 39.99,
    image: "/products/boothaakje.png",
    category: "Decoration",
    description: "Een elegant boot haakje.",
    features: ["Handgemaakt sheetmetal", "poedercoat"],
    materials: "Hoogwaardig alluminium",
    dimensions: "H: 20cm, Ø: 25cm, kabellengte: 150cm",
  },
  {
    id: 6,
    name: "Wand Kledinghanger",
    price: 109.99,
    image: "/products/kapstok.png",
    category: "Decoration",
    description: "Een mooie wand kleding hanger. Brengt een industriële touch aan elk interieur.",
    features: ["Handgemaakt sheetmetal", "poedercoat"],
    materials: "Hoogwaardig alluminium",
    dimensions: "H: 15cm, B: 18cm, D: 18cm",
  },
  {
    id: 7,
    name: "Hoek schabje",
    price: 89.99,
    image: "/products/douchehoek.png",
    category: "Decoration",
    description: "Een elegant hoek schapje. Creëert ruimte in hoeken van bv. een douche.",
    features: ["Handgemaakt sheetmetal", "poedercoat"],
    materials: "Hoogwaardig alluminium",
    dimensions: "H: 20cm, Ø: 25cm, kabellengte: 150cm",
  },
]

export function getProductById(id: number): Product | undefined {
  return products.find((product) => product.id === id)
}
