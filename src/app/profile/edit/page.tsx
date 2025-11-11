import { createClientForBackend } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { EditProfileForm } from "@/components/profile/edit-profile-form"

export default async function EditProfilePage() {
  const supabase = await createClientForBackend()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("Usuario nçao logado")
    redirect("/auth/login")
  }

  console.log(" User found:", user.id)

  const { data: profile, error } = await supabase
    .from("tb01_perfis")
    .select("*")
    .eq("tb01_id", user.id)
    .maybeSingle()

  console.log(" Profile data:", profile ? "found" : "not found", "Error:", error?.message || "none")

  if (!profile) {
    const { data: newProfile, error: createError } = await supabase
      .from("tb01_perfis")
      .insert({
        tb01_id: user.id,
        tb01_nome: user.email?.split("@")[0] || "Usuário",
      })
      .select()
      .single()

    if (createError || !newProfile) {
      console.error("Erro para criar perfil:", createError)
      redirect("/dashboard")
    }
    return <EditProfileForm profile={newProfile} user={user} />
  }
  return <EditProfileForm profile={profile} user={user} />
}