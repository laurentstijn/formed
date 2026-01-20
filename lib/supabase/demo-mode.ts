export async function getDemoMode(): Promise<boolean> {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const { data, error } = await supabase.from("settings").select("value").eq("key", "demo_mode").maybeSingle()

  // If no setting exists yet or there's an error, default to false (demo mode off)
  if (error || !data) {
    return false
  }

  return data.value === "true" || data.value === true
}

export async function setDemoMode(enabled: boolean): Promise<{ success: boolean; error?: string }> {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const { error } = await supabase.from("settings").upsert(
    {
      key: "demo_mode",
      value: String(enabled),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  )

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
