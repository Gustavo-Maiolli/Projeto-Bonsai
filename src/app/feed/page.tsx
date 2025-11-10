import { createClientForBackend } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Leaf, Search } from "lucide-react"
import Link from "next/link"
import { PostCard } from "@/components/feed/post-card"
export const revalidate = 0;

export default async function FeedPage() {
  const supabase = await createClientForBackend()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("tb01_perfis")
    .select("*")
    .eq("tb01_id", user.id)
    .maybeSingle()
    
  /*
  const { data: posts, error: postsError } = await supabase
    .from("tb03_publicacoes")
    .select(
      `
      *,
      tb02_plantas!tb03_id_planta(             
            tb02_id,
            tb02_especie,
            tb02_apelido,
            tb02_publica,
            tb02_id_usuario
          ),
          tb01_perfis!tb03_id_usuario(  
            tb01_id,
            tb01_nome,
            tb01_avatar_url
          ),
          tb04_curtidas(tb04_id, tb04_id_usuario), 
          tb05_comentarios(tb05_id)  
    `,
    )
    .order("tb03_criado_em", { ascending: false })
 */

    const { data: posts, error: postsError } = await supabase
  .from("tb03_publicacoes")
  .select("*")
  .order("tb03_criado_em", { ascending: false })

if (postsError) {
  console.error("Erro ao buscar posts:", postsError)
  throw postsError
}

if (!posts || posts.length === 0) {
  return []
}

// IDs para consultas relacionadas
const userIds = [...new Set(posts.map((p) => p.tb03_id_usuario))]
const plantIds = [...new Set(posts.map((p) => p.tb03_id_planta))]
const postIds = posts.map((p) => p.tb03_id)

// Buscar perfis
const { data: perfis } = await supabase
  .from("tb01_perfis")
  .select("tb01_id, tb01_nome, tb01_avatar_url")
  .in("tb01_id", userIds)

// Buscar plantas
const { data: plantas } = await supabase
  .from("tb02_plantas")
  .select("tb02_id, tb02_especie, tb02_apelido, tb02_publica, tb02_id_usuario")
  .in("tb02_id", plantIds)

// Buscar curtidas
const { data: curtidas } = await supabase
  .from("tb04_curtidas")
  .select("tb04_id, tb04_id_publicacao, tb04_id_usuario")
  .in("tb04_id_publicacao", postIds)

// Buscar comentários
const { data: comentarios } = await supabase
  .from("tb05_comentarios")
  .select("tb05_id, tb05_id_publicacao")
  .in("tb05_id_publicacao", postIds)

// Montar resultado final (equivalente ao join)
const postsWithRelations = posts.map((post) => ({
  ...post,
  tb01_perfis: perfis?.find((p) => p.tb01_id === post.tb03_id_usuario),
  tb02_plantas: plantas?.find((pl) => pl.tb02_id === post.tb03_id_planta),
  tb04_curtidas: curtidas?.filter((c) => c.tb04_id_publicacao === post.tb03_id) || [],
  tb05_comentarios: comentarios?.filter((c) => c.tb05_id_publicacao === post.tb03_id) || [],
}))

  console.log(" Posts query error:", postsError)
  console.log(" Posts data:", posts)

  const postsWithCounts = posts?.map((post) => ({
    ...post,
    _count: {
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
    },
    isLikedByUser: post.likes?.some((like: any) => like.user_id === user.id) || false,
  }))

  return (
    <div className="page-bg">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-primary">Feed</h2>
          <p className="text-primary/70 mt-1">Veja a evolução dos bonsais da comunidade</p>
        </div>

        <div className="space-y-6">
          {postsWithCounts && postsWithCounts.length > 0 ? (
            postsWithCounts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} />)
          ) : (
            <div className="text-center py-16">
              <Leaf className="h-16 w-16 text-primary/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">Nenhum post ainda</h3>
              <p className="text-muted-foreground mb-6">Seja o primeiro a compartilhar a evolução do seu bonsai!</p>
              <Button asChild className="bg-accent hover:bg-accent/90">
                <Link href="/plants">Ver minhas plantas</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
