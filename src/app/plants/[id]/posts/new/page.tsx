import { createClientForBackend } from "@/lib/supabase/serverClient"
import { notFound, redirect } from "next/navigation"
import { PostForm } from "@/components/feed/post-form"

interface NewPostPageProps {
  params: Promise<{ id: string }>
}

export default async function NewPostPage({ params }: NewPostPageProps) {
  const { id } = await params
  const supabase = await createClientForBackend()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: plant, error } = await supabase.from("tb02_plantas").select("*").eq("tb02_id", id).eq("tb02_id_usuario", user.id).single()

  if (error || !plant) {
    notFound()
  }

  return <PostForm userId={user.id} plant={plant} />
}
