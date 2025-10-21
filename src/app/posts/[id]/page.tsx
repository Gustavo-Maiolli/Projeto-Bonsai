import { createClientForBackend } from "@/lib/supabase/serverClient"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Componentes reutilizáveis
import { PostCard } from "@/components/feed/post-card"
import { CommentSection } from "@/components/feed/comment-section"

// Tipagem dos parâmetros da rota
interface PostPageProps {
  params: { id: string }
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = params
  const supabase = await createClientForBackend()

  // 🧩 Busca usuário autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // 🧠 Busca post + planta + perfil + curtidas + comentários
  const { data: post, error } = await supabase
    .from("tb03_publicacoes")
    .select(
      `
      *,
      tb02_plantas!inner(*),
      tb01_perfis!tb03_id_usuario_fkey(*),
      tb04_curtidas(tb04_id, tb04_id_usuario),
      tb05_comentarios(tb05_id)
      `
    )
    .eq("tb03_id", id)
    .single()

  // ❌ Caso não exista post
  if (error || !post) {
    notFound()
  }

  // 🔒 Caso o post seja de planta privada e não seja do próprio usuário
  if (!post.tb02_plantas?.tb02_publica && post.tb03_id_usuario !== user.id) {
    notFound()
  }

  // 📊 Processa contadores e estado do like
  const postWithCounts = {
    ...post,
    _count: {
      likes: post.tb04_curtidas?.length || 0,
      comments: post.tb05_comentarios?.length || 0,
    },
    isLikedByUser: post.tb04_curtidas?.some(
      (like: any) => like.tb04_id_usuario === user.id
    ) || false,
  }

  // ✅ Retorno da tela
  return (
    <div className="page-bg">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 🔙 Botão para voltar */}
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/feed">← Voltar ao feed</Link>
        </Button>

        {/* 🧩 Exibe o post (curtidas, autor, planta, etc.) */}
        <PostCard
          post={postWithCounts as any}
          currentUserId={user.id}
          showActions
        />

        {/* 💬 Seção de comentários */}
        <CommentSection postId={post.tb03_id} currentUserId={user.id} />
      </div>
    </div>
  )
}
