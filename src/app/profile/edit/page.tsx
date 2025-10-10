import { createClientForBackend } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { EditProfileForm } from "@/components/profile/edit-profile-form"

export default async function EditProfilePage() {
  console.log(" Edit profile page loaded")

  const supabase = await createClientForBackend()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log(" No user found, redirecting to login")
    redirect("/auth/login")
  }

  console.log(" User found:", user.id)

  // 1. Busca do perfil existente - Usando tb01_id_usuario
  const { data: profile, error } = await supabase
    .from("tb01_perfis")
    .select("*")
    .eq("tb01_id_usuario", user.id)
    .maybeSingle()

  console.log(" Profile data:", profile ? "found" : "not found", "Error:", error?.message || "none")

  if (!profile) {
    console.log(" Creating new profile for user")
    // 2. Criação de novo perfil - Usando tb01_id_usuario e tb01_nome_exibicao
    const { data: newProfile, error: createError } = await supabase
      .from("tb01_perfis")
      .insert({
        tb01_id_usuario: user.id,
        tb01_nome_exibicao: user.email?.split("@")[0] || "Usuário",
      })
      .select()
      .single()

    if (createError || !newProfile) {
      console.error(" Error creating profile:", createError)
      redirect("/dashboard")
    }

    console.log(" New profile created successfully")
    return <EditProfileForm profile={newProfile} user={user} />
  }

  console.log(" Rendering edit form with existing profile")
  return <EditProfileForm profile={profile} user={user} />
}