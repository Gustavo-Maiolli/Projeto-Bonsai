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

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  const query = params.q || ""
  const searchType = params.type || "all"

  let users: any[] = []
  let plants: any[] = []
  let posts: any[] = []

  if (query) {
    // Search users
    if (searchType === "all" || searchType === "users") {
      const { data } = await supabase.from("profiles").select("*").ilike("display_name", `%${query}%`).limit(20)

      users = data || []
    }

    // Search plants
    if (searchType === "all" || searchType === "plants") {
      const { data: plantsData } = await supabase
        .from("plants")
        .select("*")
        .eq("is_public", true)
        .or(`species.ilike.%${query}%,nickname.ilike.%${query}%`)
        .limit(20)

      if (plantsData && plantsData.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(plantsData.map((p) => p.user_id))]

        // Fetch profiles for these users
        const { data: profilesData } = await supabase.from("profiles").select("*").in("id", userIds)

        // Map profiles to plants
        plants = plantsData.map((plant) => ({
          ...plant,
          profiles: profilesData?.find((p) => p.id === plant.user_id),
        }))
      }
    }

    // Search posts
    if (searchType === "all" || searchType === "posts") {
      const { data: postsData } = await supabase
        .from("posts")
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
          profiles!posts_user_id_fkey(
            id,
            display_name,
            avatar_url
          ),
          likes(id, user_id),
          comments(id)
        `,
        )
        .eq("plants.is_public", true)
        .ilike("description", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(20)

      posts =
        postsData?.map((post) => ({
          ...post,
          _count: {
            likes: post.likes?.length || 0,
            comments: post.comments?.length || 0,
          },
          isLikedByUser: post.likes?.some((like: any) => like.user_id === user.id) || false,
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
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                {profile?.display_name?.charAt(0).toUpperCase() || "U"}
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
