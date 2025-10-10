import { createClientForBackend } from "@/lib/supabase/serverClient"
import { notFound, redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Leaf, Search } from "lucide-react"
import Link from "next/link"
import { PostCard } from "@/components/feed/post-card"
import { CommentSection } from "@/components/feed/comment-section"
import { Button } from "@/components/ui/button"

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const supabase = await createClientForBackend()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Busca do perfil do usuário logado (usado no header)
  const { data: profile } = await supabase.from("tb01_perfis").select("*").eq("tb01_id_usuario", user.id).single()

  // Busca da publicação com relações (joins)
  const { data: post, error } = await supabase
    .from("tb03_publicacoes")
    .select(
      `
      *,
      tb02_plantas!inner(*),
      tb01_perfis!tb03_id_usuario_fkey(*),
      tb04_curtidas(tb04_id, tb04_id_usuario),
      tb05_comentarios(tb05_id)
    `,
    )
    .eq("tb03_id", id)
    .single()

  if (error || !post) {
    notFound()
  }

  // Verifica se o usuário pode ver esta publicação
  // Acesso à coluna da planta
  if (!post.tb02_plantas?.tb02_publica && post.tb03_id_usuario !== user.id) {
    notFound()
  }

  const postWithCounts = {
    ...post,
    _count: {
      // Usando os novos nomes das relações
      likes: post.tb04_curtidas?.length || 0,
      comments: post.tb05_comentarios?.length || 0,
    },
    // Adicionando a verificação de like do usuário
    isLikedByUser: post.tb04_curtidas?.some((like: any) => like.tb04_id_usuario === user.id) || false,
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
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/search">
                <Search className="h-4 w-4" />
              </Link>
            </Button>
            <Link href={`/profile/${user.id}`}>
              <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 ring-emerald-600">
                <AvatarImage src={profile?.tb01_url_avatar || undefined} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {profile?.tb01_nome_exibicao.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/feed">← Voltar ao feed</Link>
        </Button>

        {/* O componente PostCard precisará ser ajustado para esperar a nova estrutura de dados (tb03_publicacoes) */}
        <PostCard post={postWithCounts as any} currentUserId={user.id} showActions />

        <CommentSection postId={post.tb03_id} currentUserId={user.id} />
      </div>
    </div>
  )
}