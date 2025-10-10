import { createClientForBackend } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Leaf } from "lucide-react"
import Link from "next/link"
import { SearchInterface } from "@/components/search/search-interface"

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const supabase = await createClientForBackend()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Busca do perfil do usuário logado (para o header)
  const { data: profile } = await supabase
    .from("tb01_perfis")
    .select("*")
    .eq("tb01_id", user.id) // Usando tb01_id
    .maybeSingle()

  const query = params.q || ""
  const searchType = params.type || "all"

  let users: any[] = []
  let plants: any[] = []
  let posts: any[] = []

  if (query) {
    // Search users (tb01_perfis)
    if (searchType === "all" || searchType === "users") {
      const { data } = await supabase
        .from("tb01_perfis")
        .select("*")
        .ilike("tb01_nome", `%${query}%`) // Usando tb01_nome
        .limit(20)

      users = data || []
    }

    // Search plants (tb02_plantas)
    if (searchType === "all" || searchType === "plants") {
      const { data: plantsData } = await supabase
        .from("tb02_plantas")
        .select("*")
        .eq("tb02_publica", true) // Usando tb02_publica
        .or(`tb02_especie.ilike.%${query}%,tb02_apelido.ilike.%${query}%`) // Usando tb02_especie, tb02_apelido
        .limit(20)

      if (plantsData && plantsData.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(plantsData.map((p) => p.tb02_id_usuario))] // Usando tb02_id_usuario

        // Fetch profiles for these users
        const { data: profilesData } = await supabase
          .from("tb01_perfis")
          .select("*")
          .in("tb01_id", userIds) // Usando tb01_id

        // Map profiles to plants
        plants = plantsData.map((plant) => ({
          ...plant,
          // Mapeando para o campo de ID correto
          profiles: profilesData?.find((p) => p.tb01_id === plant.tb02_id_usuario),
        }))
      }
    }

    // Search posts (tb03_publicacoes)
    if (searchType === "all" || searchType === "posts") {
      const { data: postsData } = await supabase
        .from("tb03_publicacoes")
        .select(
          `
          *,
          tb02_plantas!inner(             // Relação com tb02_plantas
            tb02_id,
            tb02_especie,
            tb02_apelido,
            tb02_publica,
            tb02_id_usuario
          ),
          tb01_perfis!tb03_id_usuario_fkey(  // Relação com tb01_perfis (Autor)
            tb01_id,
            tb01_nome,
            tb01_avatar_url
          ),
          tb04_curtidas(tb04_id, tb04_id_usuario), // Relação de likes
          tb05_comentarios(tb05_id)          // Relação de comentários
        `,
        )
        // Filtra posts apenas de plantas públicas (usando o alias da coluna da planta)
        .eq("tb02_plantas.tb02_publica", true) 
        .ilike("tb03_conteudo", `%${query}%`) // Usando tb03_conteudo (assumindo que o campo 'description' anterior era o conteúdo do post)
        .order("tb03_data_criacao", { ascending: false }) // Usando tb03_data_criacao
        .limit(20)

      posts =
        postsData?.map((post: any) => ({ // Tipagem 'any' temporária para facilitar o mapeamento
          ...post,
          _count: {
            // Usando as novas relações
            likes: post.tb04_curtidas?.length || 0,
            comments: post.tb05_comentarios?.length || 0,
          },
          // Usando a nova coluna de ID do usuário no like
          isLikedByUser: post.tb04_curtidas?.some((like: any) => like.tb04_id_usuario === user.id) || false,
        })) || []
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="border-b border-emerald-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-900">Bonsai Care</h1>
          </Link>
          <Link href={`/profile/${user.id}`}>
            <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 ring-emerald-600">
              {/* Usando tb01_avatar_url */}
              <AvatarImage src={profile?.tb01_avatar_url || undefined} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                {/* Usando tb01_nome */}
                {profile?.tb01_nome?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <SearchInterface
          initialQuery={query}
          initialType={searchType}
          initialUsers={users}
          initialPlants={plants}
          initialPosts={posts}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}