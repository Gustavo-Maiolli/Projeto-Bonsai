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
import { Switch } from "@/components/ui/switch"
import { Leaf, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Plant } from "@/lib/types" 


interface PlantFormProps {
  userId: string
  plant?: Plant 
}

export function PlantForm({ userId, plant }: PlantFormProps) {
  const router = useRouter()
  const isEditing = !!plant

  const [species, setSpecies] = useState(plant?.tb02_especie || "")
  const [nickname, setNickname] = useState(plant?.tb02_apelido || "")
  const [location, setLocation] = useState(plant?.tb02_localizacao || "")
  const [temperature, setTemperature] = useState(plant?.tb02_temperatura || "")
  const [startDate, setStartDate] = useState(plant?.tb02_data_inicio || "")
  const [wateringFrequency, setWateringFrequency] = useState(plant?.tb02_frequencia_rega?.toString() || "")
  const [sunFrequency, setSunFrequency] = useState(plant?.tb02_frequencia_sol?.toString() || "")
  const [careNotes, setCareNotes] = useState(plant?.tb02_notas_cuidado || "")
  const [imageUrl, setImageUrl] = useState(plant?.tb02_url_imagem || "")
  const [isPublic, setIsPublic] = useState(plant?.tb02_publica ?? true)
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
      
      // CORREÇÃO CRÍTICA: Definir o caminho de upload para a pasta do usuário
      // O RLS exige o formato 'userId/nome_do_arquivo' para validar a propriedade.
      const uploadPath = `${userId}/${Date.now()}.${fileExt}`

      // O bucket do storage é "plantas"
      const { data, error: uploadError } = await supabase.storage
        .from("tb02_plantas")
        .upload(uploadPath, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("tb02_plantas").getPublicUrl(uploadPath) // Usar uploadPath aqui também

      setImageUrl(publicUrl)
      console.log("Foto enviada com sucesso!", publicUrl)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer upload desconhecido"
      setError(`Erro ao fazer upload da foto: ${errorMessage}`)
      console.error("Erro no upload:", err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createBrowserSupabaseClientForFrontend()

      // 1. Mapeamento de dados para a nomenclatura tb02_
      const plantData = {
        tb02_id_usuario: userId,
        tb02_especie: species,
        tb02_apelido: nickname || null,
        tb02_localizacao: location || null,
        tb02_temperatura: temperature || null,
        tb02_data_inicio: startDate,
        tb02_frequencia_rega: Number.parseInt(wateringFrequency),
        tb02_frequencia_sol: sunFrequency ? Number.parseInt(sunFrequency) : null,
        tb02_notas_cuidado: careNotes || null,
        tb02_url_imagem: imageUrl || null,
        tb02_publica: isPublic,
      }

      if (isEditing && plant) {
        // 2. Operação UPDATE - Filtrando por tb02_id
        const { error: updateError } = await supabase
          .from("tb02_plantas")
          .update(plantData)
          .eq("tb02_id", plant.tb02_id)

        if (updateError) throw updateError

        console.log("Planta atualizada com sucesso!")
        router.push(`/plants/${plant.tb02_id}`)
      } else {
        // 3. Operação INSERT
        const { data, error: insertError } = await supabase.from("tb02_plantas").insert(plantData).select().single()

        if (insertError) throw insertError

        console.log(`${nickname || species} foi cadastrada com sucesso!`)
        // Redirecionando com o novo ID: data.tb02_id
        router.push(`/plants/${data.tb02_id}`)
      }

      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(`Erro ao salvar planta: ${errorMessage}`)
      console.error("Erro ao salvar planta:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-bg">

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-900">
              {isEditing ? "Editar Planta" : "Cadastrar Nova Planta"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 rounded-lg overflow-hidden bg-emerald-100 flex items-center justify-center">
                  {imageUrl ? (
                    <img src={imageUrl || "/placeholder.svg"} alt="Planta" className="w-full h-full object-cover" />
                  ) : (
                    <Leaf className="h-16 w-16 text-emerald-300" />
                  )}
                </div>
                <div>
                  <Label htmlFor="image" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
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

              {/* Species */}
              <div className="space-y-2">
                <Label htmlFor="species">
                  Espécie <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="species"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  placeholder="Ex: Ficus Retusa"
                  required
                />
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <Label htmlFor="nickname">Apelido</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ex: Meu primeiro bonsai"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Varanda, Jardim"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperatura</Label>
                <Input
                  id="temperature"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="Ex: 20-25°C"
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Data de início do cultivo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              {/* Watering Frequency */}
              <div className="space-y-2">
                <Label htmlFor="wateringFrequency">
                  Frequência de rega (dias) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="wateringFrequency"
                  type="number"
                  min="1"
                  value={wateringFrequency}
                  onChange={(e) => setWateringFrequency(e.target.value)}
                  placeholder="Ex: 3"
                  required
                />
              </div>

              {/* Sun Frequency */}
              <div className="space-y-2">
                <Label htmlFor="sunFrequency">Frequência de exposição ao sol (dias)</Label>
                <Input
                  id="sunFrequency"
                  type="number"
                  min="1"
                  value={sunFrequency}
                  onChange={(e) => setSunFrequency(e.target.value)}
                  placeholder="Ex: 7"
                />
              </div>

              {/* Care Notes */}
              <div className="space-y-2">
                <Label htmlFor="careNotes">Notas de cuidado</Label>
                <Textarea
                  id="careNotes"
                  value={careNotes}
                  onChange={(e) => setCareNotes(e.target.value)}
                  rows={4}
                  placeholder="Adicione observações sobre cuidados especiais, fertilização, poda, etc."
                />
              </div>

              {/* Public/Private */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic" className="text-base">
                    Planta pública
                  </Label>
                  <p className="text-sm text-muted-foreground">Permitir que outros usuários vejam esta planta</p>
                </div>
                <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
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
                      Salvando...
                    </>
                  ) : isEditing ? (
                    "Salvar alterações"
                  ) : (
                    "Cadastrar planta"
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
