-- Seed initial products from the default product list
INSERT INTO products (name, price, image, technical_drawing, category, description, features, materials, dimensions, colors)
VALUES
  (
    'Cactus Wandhaakje',
    49.99,
    '/products/cactus.png',
    '/products/technical/cactus-technical.svg',
    'Decoration',
    'Een elegante haakje dat tijdloze schoonheid combineert met functioneel design.',
    ARRAY['Handgemaakt sheetmetal', 'poedercoat'],
    'Hoogwaardig alluminium',
    'H: 25cm, Ø: 12cm',
    '[
      {
        "name": "Koper Rosé",
        "hex": "#B87333",
        "images": ["/products/cactus.png", "/products/cactus-detail-1.jpg", "/products/cactus-side.jpg", "/products/cactus-lifestyle.jpg"]
      },
      {
        "name": "Zwart Mat",
        "hex": "#2C2C2C",
        "images": ["/products/cactus.png", "/products/cactus-detail-1.jpg"]
      },
      {
        "name": "Wit",
        "hex": "#F5F5F5",
        "images": ["/products/cactus.png"]
      },
      {
        "name": "Grijs",
        "hex": "#808080",
        "images": ["/products/cactus.png"]
      },
      {
        "name": "Goud",
        "hex": "#D4AF37",
        "images": ["/products/cactus.png"]
      }
    ]'::jsonb
  ),
  (
    'Klein Wandhaakje',
    24.99,
    '/products/haakje.png',
    NULL,
    'Decoration',
    'Een klein haakje om een jas/ handdoek aan te hangen. Perfect in elk interieur.',
    ARRAY['Minimalistisch haakje', 'Perfect voor elk interieur', 'Handgemaakt'],
    'alluminium',
    'Klein: Ø 12cm, Medium: Ø 16cm, Groot: Ø 20cm',
    NULL
  ),
  (
    'Elegant dienblad',
    119.99,
    '/products/dienblad.png',
    NULL,
    'Decoration',
    'Een prachtige dienblad dat op elke salontafel past. Het minimalistische ontwerp past perfect in moderne woonruimtes.',
    ARRAY['Handgemaakt sheetmetal', 'poedercoat'],
    'Hoogwaardig alluminium',
    'H: 40cm, B: 120cm, D: 60cm',
    NULL
  ),
  (
    'Badkamer handdoek rekje',
    149.99,
    '/products/handdoek.png',
    NULL,
    'Decoration',
    'Een luxe handdoek rekje. De natuurlijke kleur past bij elk interieur.',
    ARRAY['Handgemaakt sheetmetal', 'natural'],
    'Hoogwaardig alluminium',
    '45cm x 45cm',
    NULL
  ),
  (
    'Boot Haakje',
    39.99,
    '/products/boothaakje.png',
    NULL,
    'Decoration',
    'Een elegant boot haakje.',
    ARRAY['Handgemaakt sheetmetal', 'poedercoat'],
    'Hoogwaardig alluminium',
    'H: 20cm, Ø: 25cm, kabellengte: 150cm',
    NULL
  ),
  (
    'Wand Kledinghanger',
    109.99,
    '/products/kapstok.png',
    NULL,
    'Decoration',
    'Een mooie wand kleding hanger. Brengt een industriële touch aan elk interieur.',
    ARRAY['Handgemaakt sheetmetal', 'poedercoat'],
    'Hoogwaardig alluminium',
    'H: 15cm, B: 18cm, D: 18cm',
    NULL
  ),
  (
    'Hoek schabje',
    89.99,
    '/products/douchehoek.png',
    NULL,
    'Decoration',
    'Een elegant hoek schapje. Creëert ruimte in hoeken van bv. een douche.',
    ARRAY['Handgemaakt sheetmetal', 'poedercoat'],
    'Hoogwaardig alluminium',
    'H: 20cm, Ø: 25cm, kabellengte: 150cm',
    NULL
  )
ON CONFLICT DO NOTHING;
