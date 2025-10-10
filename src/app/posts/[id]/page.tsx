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

  const { data: profile } = await supabase.from("tb01_perfis").select("*").eq("id", user.id).single()

  const { data: post, error } = await supabase
    .from("tb03_publicacoes")
    .select(
      `
      *,
      plants!inner(*, profiles(*)),
      profiles(*),
      likes(id, user_id),
      comments(id)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !post) {
    notFound()
  }

  // Check if user can view this post
  if (!post.plants?.is_public && post.user_id !== user.id) {
    notFound()
  }

  const postWithCounts = {
    ...post,
    _count: {
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
    },
    //isLikedByUser: post.likes?.some((like) => like.user_id === user.id) || false,
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
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {profile?.display_name.charAt(0).toUpperCase()}
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

        <PostCard post={postWithCounts} currentUserId={user.id} showActions />

        <CommentSection postId={post.id} currentUserId={user.id} />
      </div>
    </div>
  )
}
