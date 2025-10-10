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
  post: any // O objeto post agora deve conter a nova nomenclatura de chaves
  currentUserId: string
  showActions?: boolean
}

export function PostCard({ post, currentUserId, showActions = false }: PostCardProps) {
  const router = useRouter()
  // As propriedades isLikedByUser e _count.likes vêm do fetch inicial, que já foi corrigido no SearchPage/FeedPage
  const [isLiked, setIsLiked] = useState(post.isLikedByUser)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Checa se o usuário logado é o dono do post
  const isOwner = post.tb03_id_usuario === currentUserId

  const handleLike = async () => {
    const supabase = createBrowserSupabaseClientForFrontend()

    if (isLiked) {
      // Unlike - Usando tb04_id_publicacao e tb04_id_usuario
      const { error } = await supabase
        .from("tb04_curtidas")
        .delete()
        .eq("tb04_id_publicacao", post.tb03_id)
        .eq("tb04_id_usuario", currentUserId)

      if (!error) {
        setIsLiked(false)
        setLikeCount((prev: number) => prev - 1)
      }
    } else {
      // Like - Usando tb04_id_publicacao e tb04_id_usuario
      const { error } = await supabase.from("tb04_curtidas").insert({
        tb04_id_publicacao: post.tb03_id,
        tb04_id_usuario: currentUserId,
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
      // Exclusão do post - Usando tb03_id
      const { error } = await supabase.from("tb03_publicacoes").delete().eq("tb03_id", post.tb03_id)

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

  // Desestruturando o perfil e a planta para facilitar a leitura do JSX
  const userProfile = post.tb01_perfis
  const plantData = post.tb02_plantas

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            {/* Link para o perfil - Usando tb03_id_usuario */}
            <Link href={`/profile/${post.tb03_id_usuario}`} className="flex items-center gap-3 hover:opacity-80">
              <Avatar>
                {/* Usando tb01_url_avatar */}
                <AvatarImage src={userProfile?.tb01_url_avatar || undefined} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {/* Usando tb01_nome_exibicao */}
                  {userProfile?.tb01_nome_exibicao.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                {/* Usando tb01_nome_exibicao */}
                <p className="font-semibold text-emerald-900">{userProfile?.tb01_nome_exibicao}</p>
                {/* Link para a planta - Usando tb02_id */}
                <Link href={`/plants/${plantData?.tb02_id}`} className="text-sm text-muted-foreground hover:underline">
                  {/* Usando tb02_apelido ou tb02_especie */}
                  {plantData?.tb02_apelido || plantData?.tb02_especie}
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
            {/* Usando tb03_url_imagem */}
            <img src={post.tb03_url_imagem || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
          </div>

          {/* Actions */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleLike} className="p-0 h-auto hover:bg-transparent">
                <Heart className={`h-6 w-6 ${isLiked ? "fill-red-500 text-red-500" : "text-emerald-900"}`} />
              </Button>
              {!showActions && (
                <Link href={`/posts/${post.tb03_id}`}>
                  <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                    <MessageCircle className="h-6 w-6 text-emerald-900" />
                  </Button>
                </Link>
              )}
            </div>

            <div>
              <p className="font-semibold text-sm text-emerald-900">{likeCount} curtidas</p>
            </div>

            {/* Usando tb03_conteudo */}
            {post.tb03_conteudo && (
              <div>
                {/* Usando tb01_nome_exibicao */}
                <span className="font-semibold text-emerald-900">{userProfile?.tb01_nome_exibicao}</span>{" "}
                <span className="text-emerald-700">{post.tb03_conteudo}</span>
              </div>
            )}

            {!showActions && post._count.comments > 0 && (
              <Link href={`/posts/${post.tb03_id}`} className="text-sm text-muted-foreground hover:underline block">
                Ver todos os {post._count.comments} comentários
              </Link>
            )}

            <p className="text-xs text-muted-foreground">
              {/* Usando tb03_data_criacao */}
              {new Date(post.tb03_data_criacao).toLocaleDateString("pt-BR", {
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