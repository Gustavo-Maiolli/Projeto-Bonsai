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

  // Busca do perfil do usuário logado (usado no header)
  const { data: profile } = await supabase.from("tb01_perfis").select("*").eq("tb01_id", user.id).maybeSingle()

  // Busca da planta
  const { data: plant, error } = await supabase.from("tb02_plantas").select("*").eq("tb02_id", id).maybeSingle()

  if (error || !plant) {
    notFound()
  }

  // Verifica se o usuário pode ver esta planta
  if (!plant.tb02_publica && plant.tb02_id_usuario !== user.id) {
    notFound()
  }

  const isOwner = plant.tb02_id_usuario === user.id

  // Cálculo de dias desde o início
  const startDate = new Date(plant.tb02_data_inicio)
  const today = new Date()
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Busca do perfil do proprietário da planta
  const { data: plantOwnerProfile } = await supabase
    .from("tb01_perfis")
    .select("*")
    .eq("tb01_id", plant.tb02_id_usuario)
    .maybeSingle()

  // Busca dos posts da planta
  const { data: posts } = await supabase
    .from("tb03_publicacoes")
    .select("*")
    .eq("tb03_id_planta", id)
    .order("tb03_data_criacao", { ascending: false })

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
                <AvatarImage src={profile?.tb01_avatar_url || undefined} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {profile?.tb01_nome?.charAt(0).toUpperCase() || "U"}
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
                {plant.tb02_url_imagem ? (
                  <img
                    src={plant.tb02_url_imagem || "/placeholder.svg"}
                    alt={plant.tb02_apelido || plant.tb02_especie}
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
                  <Link href={`/plants/${plant.tb02_id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
                <DeletePlantButton plantId={plant.tb02_id} />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-3xl font-bold text-emerald-900">{plant.tb02_apelido || plant.tb02_especie}</h2>
                  {plant.tb02_apelido && <p className="text-lg text-muted-foreground">{plant.tb02_especie}</p>}
                </div>
                {plant.tb02_publica ? (
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
                <Link href={`/profile/${plant.tb02_id_usuario}`} className="flex items-center gap-2 mt-3 hover:opacity-80">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={plantOwnerProfile.tb01_avatar_url || undefined} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                      {plantOwnerProfile.tb01_nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{plantOwnerProfile.tb01_nome}</span>
                </Link>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plant.tb02_localizacao && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900">Localização</p>
                      <p className="text-sm text-muted-foreground">{plant.tb02_localizacao}</p>
                    </div>
                  </div>
                )}

                {plant.tb02_temperatura && (
                  <div className="flex items-start gap-3">
                    <Thermometer className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900">Temperatura</p>
                      <p className="text-sm text-muted-foreground">{plant.tb02_temperatura}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Data de início</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(plant.tb02_data_inicio).toLocaleDateString("pt-BR")} ({daysSinceStart} dias)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Droplet className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Frequência de rega</p>
                    <p className="text-sm text-muted-foreground">A cada {plant.tb02_frequencia_rega} dias</p>
                  </div>
                </div>

                {plant.tb02_frequencia_sol && (
                  <div className="flex items-start gap-3">
                    <Sun className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900">Exposição ao sol</p>
                      <p className="text-sm text-muted-foreground">A cada {plant.tb02_frequencia_sol} dias</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {plant.tb02_notas_cuidado && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notas de cuidado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-emerald-700 whitespace-pre-wrap">{plant.tb02_notas_cuidado}</p>
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
                <Link href={`/plants/${plant.tb02_id}/posts/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Post
                </Link>
              </Button>
            )}
          </div>

          {posts && posts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <Link key={post.tb03_id} href={`/posts/${post.tb03_id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-emerald-100 relative">
                      <img
                        src={post.tb03_url_imagem || "/placeholder.svg"}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.tb03_data_criacao).toLocaleDateString("pt-BR")}
                      </p>
                      {post.tb03_descricao && (
                        <p className="text-sm text-emerald-700 mt-1 line-clamp-2">{post.tb03_descricao}</p>
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
                    <Link href={`/plants/${plant.tb02_id}/posts/new`}>
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