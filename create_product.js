const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function create() {
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        name: 'Eigen Ontwerp (DXF)',
        price: 0,
        description: 'Upload uw DXF voor direct lasersnijden.',
        category: 'Maatwerk',
        is_active: true,
        stock: 999,
      }
    ]);
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success:", data);
  }
}

create();
