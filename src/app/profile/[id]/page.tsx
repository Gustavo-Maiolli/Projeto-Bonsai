import { createClientForBackend } from "@/lib/supabase/serverClient"
import { notFound, redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Calendar, Settings } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "@/components/profile/logout-button"

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params
  const id = resolvedParams.id

  console.log(" Profile page - received id:", id)

  // Check if trying to access edit route - redirect immediately
  if (id === "edit" || id.includes("edit")) {
    console.log(" Redirecting to edit page")
    redirect("/profile/edit")
  }

  const supabase = await createClientForBackend()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwnProfile = user?.id === id

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase.from("tb01_perfis").select("*").eq("id", id).maybeSingle()

  console.log(" Profile data:", profile ? "found" : "not found", "Error:", profileError?.message || "none")

  if (!profile) {
    // If it's the user's own profile and doesn't exist, create it or redirect to edit
    if (isOwnProfile && user) {
      console.log(" Creating profile for user:", user.id)
      // Try to create the profile
      const { error: insertError } = await supabase.from("tb01_perfis").insert({
        id: user.id,
        display_name: user.email?.split("@")[0] || "Usuário",
        bio: null,
        avatar_url: null,
      })

      // If creation succeeded, redirect to edit page to complete profile
      if (!insertError) {
        console.log(" Profile created, redirecting to edit")
        redirect("/profile/edit")
      } else {
        console.log(" Error creating profile:", insertError.message)
      }
    }

    // If it's someone else's profile or creation failed, show not found
    console.log(" Profile not found, showing 404")
    notFound()
  }

  // Fetch user's plants
  const { data: plants } = await supabase
    .from("tb02_plantas")
    .select("*")
    .eq("user_id", id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="border-b border-emerald-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-900">Bonsai Care</h1>
          </Link>
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            {isOwnProfile && <LogoutButton />}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
                  {profile.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-emerald-900">{profile.display_name}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4" />
                      Membro desde{" "}
                      {new Date(profile.created_at).toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <Button asChild size="sm" variant="outline">
                      <Link href="/profile/edit">
                        <Settings className="h-4 w-4 mr-2" />
                        Editar perfil
                      </Link>
                    </Button>
                  )}
                </div>
                {profile.bio && <p className="text-emerald-700 mt-3">{profile.bio}</p>}
                <div className="flex gap-4 mt-4 text-sm">
                  <div>
                    <span className="font-semibold text-emerald-900">{plants?.length || 0}</span>{" "}
                    <span className="text-muted-foreground">plantas</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plants Grid */}
        <div>
          <h3 className="text-xl font-semibold text-emerald-900 mb-4">{isOwnProfile ? "Minhas Plantas" : "Plantas"}</h3>
          {plants && plants.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plants.map((plant) => (
                <Card key={plant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/plants/${plant.id}`}>
                    <div className="aspect-square bg-emerald-100 relative">
                      {plant.image_url ? (
                        <img
                          src={plant.image_url || "/placeholder.svg"}
                          alt={plant.nickname || plant.species}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="h-16 w-16 text-emerald-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-emerald-900">{plant.nickname || plant.species}</h4>
                      <p className="text-sm text-muted-foreground">{plant.species}</p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Leaf className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Você ainda não cadastrou nenhuma planta"
                    : "Este usuário ainda não tem plantas públicas"}
                </p>
                {isOwnProfile && (
                  <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/plants/new">Cadastrar primeira planta</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
