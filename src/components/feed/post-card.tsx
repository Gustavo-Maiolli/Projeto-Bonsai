"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClientForFrontend } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, MoreVertical, Trash2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PostCardProps {
  post: any
  currentUserId: string
  showActions?: boolean
}

export function PostCard({ post, currentUserId, showActions = false }: PostCardProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(post.isLikedByUser)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isOwner = post.user_id === currentUserId

  const handleLike = async () => {
    const supabase = createBrowserSupabaseClientForFrontend()

    if (isLiked) {
      // Unlike
      const { error } = await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUserId)

      if (!error) {
        setIsLiked(false)
        setLikeCount((prev: number) => prev - 1)
      }
    } else {
      // Like
      const { error } = await supabase.from("likes").insert({
        post_id: post.id,
        user_id: currentUserId,
      })

      if (!error) {
        setIsLiked(true)
        setLikeCount((prev: number) => prev + 1)
      }
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const supabase = createBrowserSupabaseClientForFrontend()
      const { error } = await supabase.from("posts").delete().eq("id", post.id)

      if (error) throw error

      router.push("/feed")
      router.refresh()
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Erro ao excluir post")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <Link href={`/profile/${post.user_id}`} className="flex items-center gap-3 hover:opacity-80">
              <Avatar>
                <AvatarImage src={post.profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {post.profiles?.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-emerald-900">{post.profiles?.display_name}</p>
                <Link href={`/plants/${post.plant_id}`} className="text-sm text-muted-foreground hover:underline">
                  {post.plants?.nickname || post.plants?.species}
                </Link>
              </div>
            </Link>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Image */}
          <div className="aspect-square bg-emerald-100 relative">
            <img src={post.image_url || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
          </div>

          {/* Actions */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleLike} className="p-0 h-auto hover:bg-transparent">
                <Heart className={`h-6 w-6 ${isLiked ? "fill-red-500 text-red-500" : "text-emerald-900"}`} />
              </Button>
              {!showActions && (
                <Link href={`/posts/${post.id}`}>
                  <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                    <MessageCircle className="h-6 w-6 text-emerald-900" />
                  </Button>
                </Link>
              )}
            </div>

            <div>
              <p className="font-semibold text-sm text-emerald-900">{likeCount} curtidas</p>
            </div>

            {post.description && (
              <div>
                <span className="font-semibold text-emerald-900">{post.profiles?.display_name}</span>{" "}
                <span className="text-emerald-700">{post.description}</span>
              </div>
            )}

            {!showActions && post._count.comments > 0 && (
              <Link href={`/posts/${post.id}`} className="text-sm text-muted-foreground hover:underline block">
                Ver todos os {post._count.comments} comentários
              </Link>
            )}

            <p className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o post e todos os comentários e curtidas
              relacionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
