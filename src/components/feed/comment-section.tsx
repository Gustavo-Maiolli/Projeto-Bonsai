"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClientForFrontend } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, MoreVertical, Trash2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// 1. Interface atualizada com a nova nomenclatura
interface Comment {
  tb05_id: string // Novo ID do comentário
  tb05_conteudo: string // Novo campo de conteúdo
  tb05_id_usuario: string // Novo ID do usuário
  tb05_data_criacao: string // Novo campo de data de criação
  tb01_perfis: { // Nome da relação
    tb01_nome_exibicao: string // Coluna do perfil
    tb01_url_avatar: string | null // Coluna do perfil
  }
}

interface CommentSectionProps {
  postId: string // post_id será mapeado para tb05_id_publicacao
  currentUserId: string // user_id será mapeado para tb05_id_usuario
}

export function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const router = useRouter()
  // Tipagem atualizada
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    setIsLoading(true)
    const supabase = createBrowserSupabaseClientForFrontend()

    // 2. SELECT - Usando tb01_perfis para a relação e campos tb05_
    const { data, error } = await supabase
      .from("tb05_comentarios")
      .select(`
        tb05_id,
        tb05_conteudo,
        tb05_id_usuario,
        tb05_data_criacao,
        tb01_perfis (tb01_nome_exibicao, tb01_url_avatar)
      `)
      .eq("tb05_id_publicacao", postId) // Usando tb05_id_publicacao
      .order("tb05_data_criacao", { ascending: true }) // Usando tb05_data_criacao

    if (!error && data) {
      //setComments(data as Comments[])
    }

    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      const supabase = createBrowserSupabaseClientForFrontend()

      // 3. INSERT - Usando campos tb05_
      const { error } = await supabase.from("tb05_comentarios").insert({
        tb05_id_publicacao: postId, // Mapeando post_id
        tb05_id_usuario: currentUserId, // Mapeando user_id
        tb05_conteudo: newComment.trim(), // Mapeando content
      })

      if (error) throw error

      setNewComment("")
      await loadComments()
      router.refresh()
    } catch (error) {
      console.error("Error creating comment:", error)
      alert("Erro ao criar comentário")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const supabase = createBrowserSupabaseClientForFrontend()
      // 4. DELETE - Usando tb05_id
      const { error } = await supabase.from("tb05_comentarios").delete().eq("tb05_id", commentId)

      if (error) throw error

      await loadComments()
      router.refresh()
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Erro ao excluir comentário")
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        {/* Corrigido para usar a variável de estado 'comments' */}
        <CardTitle>Comentários ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            rows={3}
          />
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Comentar"
            )}
          </Button>
        </form>

        {/* Comments List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {/* Corrigido para usar a variável de estado 'comments' e os novos campos */}
            {comments.map((comment) => (
              // Usando tb05_id como key
              <div key={comment.tb05_id} className="flex gap-3">
                {/* Usando tb05_id_usuario */}
                <Link href={`/profile/${comment.tb05_id_usuario}`}>
                  <Avatar className="h-10 w-10">
                    {/* Usando tb01_url_avatar */}
                    <AvatarImage src={comment.tb01_perfis.tb01_url_avatar || undefined} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {/* Usando tb01_nome_exibicao */}
                      {comment.tb01_perfis.tb01_nome_exibicao.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 bg-emerald-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Usando tb05_id_usuario e tb01_nome_exibicao */}
                      <Link href={`/profile/${comment.tb05_id_usuario}`} className="font-semibold text-sm hover:underline">
                        {comment.tb01_perfis.tb01_nome_exibicao}
                      </Link>
                      {/* Usando tb05_conteudo */}
                      <p className="text-sm text-emerald-700 mt-1">{comment.tb05_conteudo}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {/* Usando tb05_data_criacao */}
                        {new Date(comment.tb05_data_criacao).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {/* Usando tb05_id_usuario para checagem */}
                    {comment.tb05_id_usuario === currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Usando tb05_id para exclusão */}
                          <DropdownMenuItem onClick={() => handleDelete(comment.tb05_id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhum comentário ainda. Seja o primeiro!</p>
        )}
      </CardContent>
    </Card>
  )
}