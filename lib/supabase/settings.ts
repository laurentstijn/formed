export interface StandardColor {
  name: string
  hex: string
  ral?: string
  rgb?: string
}

export async function getStandardColors(): Promise<StandardColor[]> {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const { data, error } = await supabase.from("settings").select("value").eq("key", "standard_colors").maybeSingle()

  // If no setting exists yet or there's an error, return default colors
  if (error || !data) {
    return [
      { name: "Mint green", hex: "#a3cdad", ral: "6019", rgb: "163, 205, 175" },
      { name: "Oud roze", hex: "#cb7375", ral: "3014", rgb: "203, 115, 117" },
      { name: "Koolzaad geel", hex: "#f6b600", ral: "1021", rgb: "246, 182, 0" },
      { name: "Grafiet zwart", hex: "#27292b", ral: "9011", rgb: "39, 41, 43" },
      { name: "Dusty Peach", hex: "#E1C0AA", rgb: "225, 192, 170" },
    ]
  }

  return JSON.parse(data.value)
}

export async function saveStandardColors(colors: StandardColor[]): Promise<{ success: boolean; error?: string }> {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const { error } = await supabase.from("settings").upsert(
    {
      key: "standard_colors",
      value: JSON.stringify(colors),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  )

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
