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

interface Comment {
  tb05_id: string 
  tb05_conteudo: string 
  tb05_id_usuario: string 
  tb05_data_criacao: string 
  tb01_perfis: { 
    tb01_nome: string 
    tb01_avatar_url: string | null 
  }
}

interface CommentSectionProps {
  postId: string 
  currentUserId: string 
}

export function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const router = useRouter()
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

    const { data, error } = await supabase
      .from("tb05_comentarios")
      .select(`
        tb05_id,
        tb05_conteudo,
        tb05_id_usuario,
        tb05_data_criacao,
        tb01_perfis (tb01_nome, tb01_avatar_url)
      `)
      .eq("tb05_id_publicacao", postId) 
      .order("tb05_data_criacao", { ascending: true }) 

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

      const { error } = await supabase.from("tb05_comentarios").insert({
        tb05_id_publicacao: postId, 
        tb05_id_usuario: currentUserId, 
        tb05_conteudo: newComment.trim(), 
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
      const { error } = await supabase.from("tb05_comentarios").delete().eq("tb05_id", commentId)

      if (error) throw error

      await loadComments()
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      alert("Erro ao excluir comentário")
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Comentários ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            rows={3}
          />
          <Button
            type="submit"
            className="bg-accent hover:bg-accent/90"
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

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.tb05_id} className="flex gap-3">
                <Link href={`/profile/${comment.tb05_id_usuario}`}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.tb01_perfis.tb01_avatar_url || undefined} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {comment.tb01_perfis.tb01_nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 bg-emerald-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/profile/${comment.tb05_id_usuario}`} className="font-semibold text-sm hover:underline">
                        {comment.tb01_perfis.tb01_nome}
                      </Link>
                      <p className="text-sm text-emerald-700 mt-1">{comment.tb05_conteudo}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(comment.tb05_data_criacao).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {comment.tb05_id_usuario === currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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