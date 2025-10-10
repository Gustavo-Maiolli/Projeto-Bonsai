import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PostForm } from "@/components/feed/post-form"

interface NewPostPageProps {
  params: Promise<{ id: string }>
}

export default async function NewPostPage({ params }: NewPostPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: plant, error } = await supabase.from("plants").select("*").eq("id", id).eq("user_id", user.id).single()

  if (error || !plant) {
    notFound()
  }

  return <PostForm userId={user.id} plant={plant} />
}
