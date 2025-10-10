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

  const [species, setSpecies] = useState(plant?.species || "")
  const [nickname, setNickname] = useState(plant?.nickname || "")
  const [location, setLocation] = useState(plant?.location || "")
  const [temperature, setTemperature] = useState(plant?.temperature || "")
  const [startDate, setStartDate] = useState(plant?.start_date || "")
  const [wateringFrequency, setWateringFrequency] = useState(plant?.watering_frequency?.toString() || "")
  const [sunFrequency, setSunFrequency] = useState(plant?.sun_frequency?.toString() || "")
  const [careNotes, setCareNotes] = useState(plant?.care_notes || "")
  const [imageUrl, setImageUrl] = useState(plant?.image_url || "")
  const [isPublic, setIsPublic] = useState(plant?.is_public ?? true)
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

      const { data, error: uploadError } = await supabase.storage
        .from("plants")
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("plants").getPublicUrl(fileName)

      setImageUrl(publicUrl)
      alert("Foto enviada com sucesso!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload")
      alert("Erro ao fazer upload da foto")
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

      const plantData = {
        user_id: userId,
        species,
        nickname: nickname || null,
        location: location || null,
        temperature: temperature || null,
        start_date: startDate,
        watering_frequency: Number.parseInt(wateringFrequency),
        sun_frequency: sunFrequency ? Number.parseInt(sunFrequency) : null,
        care_notes: careNotes || null,
        image_url: imageUrl || null,
        is_public: isPublic,
      }

      if (isEditing) {
        const { error: updateError } = await supabase.from("plants").update(plantData).eq("id", plant.id)

        if (updateError) throw updateError

        alert("Planta atualizada com sucesso!")
        router.push(`/plants/${plant.id}`)
      } else {
        const { data, error: insertError } = await supabase.from("plants").insert(plantData).select().single()

        if (insertError) throw insertError

        alert(`${nickname || species} foi cadastrada com sucesso!`)
        router.push(`/plants/${data.id}`)
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar planta")
      alert("Erro ao salvar planta: " + (err instanceof Error ? err.message : "Erro desconhecido"))
    } finally {
      setIsLoading(false)
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
        </div>
      </header>

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
