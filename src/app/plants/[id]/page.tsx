import { createClientForBackend } from "@/lib/supabase/serverClient"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Leaf, Calendar, Droplet, Sun, MapPin, Thermometer, Edit, Search, Plus } from "lucide-react"
import Link from "next/link"
import { DeletePlantButton } from "@/components/plants/delete-plant-button"

interface PlantPageProps {
  params: Promise<{ id: string }>
}

export default async function PlantPage({ params }: PlantPageProps) {
  const { id } = await params
  const supabase = await createClientForBackend()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  const { data: plant, error } = await supabase.from("plants").select("*").eq("id", id).maybeSingle()

  if (error || !plant) {
    notFound()
  }

  // Check if user can view this plant
  if (!plant.is_public && plant.user_id !== user.id) {
    notFound()
  }

  const isOwner = plant.user_id === user.id

  // Calculate days since start
  const startDate = new Date(plant.start_date)
  const today = new Date()
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  const { data: plantOwnerProfile } = await supabase.from("profiles").select("*").eq("id", plant.user_id).maybeSingle()

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("plant_id", id)
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
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/search">
                <Search className="h-4 w-4" />
              </Link>
            </Button>
            <Link href={`/profile/${user.id}`}>
              <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 ring-emerald-600">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {profile?.display_name.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Image Section */}
          <div>
            <Card className="overflow-hidden">
              <div className="aspect-square bg-emerald-100 relative">
                {plant.image_url ? (
                  <img
                    src={plant.image_url || "/placeholder.svg"}
                    alt={plant.nickname || plant.species}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="h-24 w-24 text-emerald-300" />
                  </div>
                )}
              </div>
            </Card>

            {isOwner && (
              <div className="flex gap-3 mt-4">
                <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  <Link href={`/plants/${plant.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
                <DeletePlantButton plantId={plant.id} />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-3xl font-bold text-emerald-900">{plant.nickname || plant.species}</h2>
                  {plant.nickname && <p className="text-lg text-muted-foreground">{plant.species}</p>}
                </div>
                {plant.is_public ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Público
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    Privado
                  </Badge>
                )}
              </div>

              {/* Owner info */}
              {plantOwnerProfile && (
                <Link href={`/profile/${plant.user_id}`} className="flex items-center gap-2 mt-3 hover:opacity-80">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={plantOwnerProfile.avatar_url || undefined} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                      {plantOwnerProfile.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{plantOwnerProfile.display_name}</span>
                </Link>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plant.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900">Localização</p>
                      <p className="text-sm text-muted-foreground">{plant.location}</p>
                    </div>
                  </div>
                )}

                {plant.temperature && (
                  <div className="flex items-start gap-3">
                    <Thermometer className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900">Temperatura</p>
                      <p className="text-sm text-muted-foreground">{plant.temperature}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Data de início</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(plant.start_date).toLocaleDateString("pt-BR")} ({daysSinceStart} dias)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Droplet className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Frequência de rega</p>
                    <p className="text-sm text-muted-foreground">A cada {plant.watering_frequency} dias</p>
                  </div>
                </div>

                {plant.sun_frequency && (
                  <div className="flex items-start gap-3">
                    <Sun className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900">Exposição ao sol</p>
                      <p className="text-sm text-muted-foreground">A cada {plant.sun_frequency} dias</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {plant.care_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notas de cuidado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-emerald-700 whitespace-pre-wrap">{plant.care_notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-emerald-900">Evolução</h3>
            {isOwner && (
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href={`/plants/${plant.id}/posts/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Post
                </Link>
              </Button>
            )}
          </div>

          {posts && posts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-emerald-100 relative">
                      <img
                        src={post.image_url || "/placeholder.svg"}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString("pt-BR")}
                      </p>
                      {post.description && (
                        <p className="text-sm text-emerald-700 mt-1 line-clamp-2">{post.description}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Leaf className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum post ainda</p>
                {isOwner && (
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href={`/plants/${plant.id}/posts/new`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar primeiro post
                    </Link>
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
