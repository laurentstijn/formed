const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const products = [
  {
    name: "Gepersonaliseerde Douchegoot",
    price: 149.00,
    description: "Een prachtige, op maat gemaakte roestvrijstalen douchegoot met uw eigen tekst en patroon eruit gelaserd. Configureer hem volledig naar wens in onze 3D tool.",
    category: "Douchegoten",
    is_active: true,
    stock: 999,
    features: ["Volledig aanpasbaar", "Roestvrij staal (RVS)", "Verschillende patronen mogelijk"],
    colors: [],
    gallery_images: [],
    materials: "Geborsteld INOX, Messing of Zwart Gecoat",
    image_url: ""
  },
  {
    name: "Gepersonaliseerd Naambordje",
    price: 89.00,
    description: "Geef uw voordeur een unieke uitstraling met dit strakke, metalen naambordje. Zowel het huisnummer als uw naam worden er haarscherp uit gelaserd.",
    category: "Naambordjes",
    is_active: true,
    stock: 999,
    features: ["Inclusief bevestigingsgaten", "Weerbestendig", "Strak design"],
    colors: [],
    gallery_images: [],
    materials: "Zwart Gecoat, Geborsteld INOX of Goud/Messing",
    image_url: ""
  }
];

async function seed() {
  for (const p of products) {
    const res = await fetch(`${supabaseUrl}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(p)
    });
    
    if (!res.ok) {
      console.error(`Error inserting ${p.name}:`, await res.text());
    } else {
      const data = await res.json();
      console.log(`Successfully added ${p.name} with ID: ${data[0].id}`);
    }
  }
}

seed();
