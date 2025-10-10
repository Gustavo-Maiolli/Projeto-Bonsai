import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PlantForm } from "@/components/plants/plant-form"

interface EditPlantPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPlantPage({ params }: EditPlantPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: plant, error } = await supabase.from("plants").select("*").eq("id", id).eq("user_id", user.id).single()

  if (error || !plant) {
    notFound()
  }

  return <PlantForm userId={user.id} plant={plant} />
}
