import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EditProfileForm } from "@/components/profile/edit-profile-form"

export default async function EditProfilePage() {
  console.log("[v0] Edit profile page loaded")

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] No user found, redirecting to login")
    redirect("/auth/login")
  }

  console.log("[v0] User found:", user.id)

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  console.log("[v0] Profile data:", profile ? "found" : "not found", "Error:", error?.message || "none")

  if (!profile) {
    console.log("[v0] Creating new profile for user")
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        display_name: user.email?.split("@")[0] || "Usuário",
      })
      .select()
      .single()

    if (createError || !newProfile) {
      console.error("[v0] Error creating profile:", createError)
      redirect("/dashboard")
    }

    console.log("[v0] New profile created successfully")
    return <EditProfileForm profile={newProfile} user={user} />
  }

  console.log("[v0] Rendering edit form with existing profile")
  return <EditProfileForm profile={profile} user={user} />
}
