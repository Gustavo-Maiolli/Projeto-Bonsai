import { createClientForBackend } from "@/lib/supabase/serverClient"
import { notFound, redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Calendar, Settings } from "lucide-react"
import Link from "next/link"


interface ProfilePageProps {
  params: { id: string }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const id = params.id

  if (id === "edit" || id.includes("edit")) {
    redirect("/profile/edit")
  }

  const supabase = await createClientForBackend()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwnProfile = user?.id === id

  const { data: profile, error: profileError } = await supabase
    .from("tb01_perfis")
    .select("*")
    .eq("tb01_id", id)
    .maybeSingle()

  if (!profile) {
    // ⚙️ Se o usuário logado ainda não tem perfil, cria e redireciona
    if (isOwnProfile && user) {
      const { error: insertError } = await supabase.from("tb01_perfis").insert({
        tb01_id: user.id,
        tb01_nome: user.email?.split("@")[0] || "Usuário",
        tb01_bio: null,
        tb01_avatar_url: null,
      })

      if (!insertError) redirect("/profile/edit")
    }

    // ❌ Se não for o próprio usuário ou falhou a criação
    notFound()
  }

  // 🌿 Busca as plantas públicas do usuário
  const { data: plants } = await supabase
    .from("tb02_plantas")
    .select("*")
    .eq("tb02_id_usuario", id)
    .eq("tb02_publica", true)
    .order("tb02_criado_em", { ascending: false })

  return (
    <div className="page-bg">
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 🧩 Seção principal do perfil */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* 👤 Avatar */}
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.tb01_avatar_url || undefined} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
                  {profile.tb01_nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* 📄 Informações do perfil */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-emerald-900">{profile.tb01_nome}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4" />
                      Membro desde{" "}
                      {new Date(profile.tb01_data_criacao).toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* ⚙️ Botão de editar (somente se for o próprio perfil) */}
                  {isOwnProfile && (
                    <Button asChild size="sm" variant="outline">
                      <Link href="/profile/edit">
                        <Settings className="h-4 w-4 mr-2" />
                        Editar perfil
                      </Link>
                    </Button>
                  )}
                </div>

                {/* 🗒️ Bio */}
                {profile.tb01_bio && <p className="text-emerald-700 mt-3">{profile.tb01_bio}</p>}

                {/* 🌱 Contador de plantas */}
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

        {/* 🌿 Seção de plantas do perfil */}
        <div>
          <h3 className="text-xl font-semibold text-emerald-900 mb-4">
            {isOwnProfile ? "Minhas Plantas" : "Plantas"}
          </h3>

          {plants && plants.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plants.map((plant) => (
                <Card
                  key={plant.tb02_id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/plants/${plant.tb02_id}`}>
                    <div className="aspect-square bg-emerald-100 relative">
                      {plant.tb02_url_imagem ? (
                        <img
                          src={plant.tb02_url_imagem || "/placeholder.svg"}
                          alt={plant.tb02_apelido || plant.tb02_especie}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="h-16 w-16 text-emerald-300" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <h4 className="font-semibold text-emerald-900">
                        {plant.tb02_apelido || plant.tb02_especie}
                      </h4>
                      <p className="text-sm text-muted-foreground">{plant.tb02_especie}</p>
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

                {/* 🌱 Botão de adicionar planta (somente se for o próprio perfil) */}
                {isOwnProfile && (
                  <Button asChild className="mt-4 bg-accent hover:bg-accent/90">
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
