"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClientForFrontend } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Plant } from "@/lib/types"

interface PostFormProps {
  userId: string
  plant: Plant // O objeto Plant deve ter as chaves tb02_id, tb02_apelido, tb02_especie
}

export function PostForm({ userId, plant }: PostFormProps) {
  const router = useRouter()

  // Mapeado para tb03_conteudo
  const [description, setDescription] = useState("")
  // Mapeado para tb03_url_imagem
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)

    try {
      const supabase = createBrowserSupabaseClientForFrontend()
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`

      // O nome do bucket 'tb03_publicacoes' é mantido
      const { data, error: uploadError } = await supabase.storage.from("tb03_publicacoes").upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("tb03_publicacoes").getPublicUrl(fileName)

      setImageUrl(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageUrl) {
      setError("Por favor, adicione uma foto")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createBrowserSupabaseClientForFrontend()

      const { data, error: insertError } = await supabase
        .from("tb03_publicacoes")
        .insert({
          // Campos atualizados para a nomenclatura tb03_
          tb03_id_usuario: userId,
          tb03_id_planta: plant.tb02_id, // Assumindo que o ID da planta está em plant.tb02_id
          tb03_url_imagem: imageUrl,
          tb03_conteudo: description || null, // Mapeado de 'description'
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Redireciona para o post usando o novo ID tb03_id
      router.push(`/posts/${data.tb03_id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-bg">
      {/* Header */}
      <header className="header">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-900">Bonsai Care</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-900">Novo Post</CardTitle>
            <p className="text-sm text-muted-foreground">
              {/* Usando tb02_apelido ou tb02_especie */}
              Compartilhe a evolução de <span className="font-semibold">{plant.tb02_apelido || plant.tb02_especie}</span>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-emerald-100 flex items-center justify-center">
                  {imageUrl ? (
                    <img src={imageUrl || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
                  ) : (
                    <Leaf className="h-24 w-24 text-emerald-300" />
                  )}
                </div>
                <div>
                  <Label htmlFor="image" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          {imageUrl ? "Alterar foto" : "Adicionar foto"}
                        </>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Conte sobre o progresso da sua planta..."
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    "Publicar"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}