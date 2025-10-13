import { createClientForBackend } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Leaf, Search } from "lucide-react"
import Link from "next/link"
import { PostCard } from "@/components/feed/post-card"


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
    
  const { data: posts, error: postsError } = await supabase
    .from("tb03_publicacoes")
    .select(
      `
      *,
      plants!inner(
        id,
        species,
        nickname,
        is_public,
        user_id
      ),
      profiles(
        id,
        display_name,
        avatar_url
      ),
      likes(id, user_id),
      comments(id)
    `,
    )
    .eq("tb02_plantas.is_public", true)
    .order("created_at", { ascending: false })

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
      {/* Header */}
      

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
