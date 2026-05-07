import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
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

  for (const p of products) {
    const { data, error } = await supabase.from('products').insert(p).select();
    if (error) {
      console.error(`Error inserting ${p.name}:`, error);
    } else {
      console.log(`Successfully added ${p.name}`);
    }
  }
}

seed();
