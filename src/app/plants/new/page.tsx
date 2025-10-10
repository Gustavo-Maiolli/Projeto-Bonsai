import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PlantForm } from "@/components/plants/plant-form"

export default async function NewPlantPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <PlantForm userId={user.id} />
}
