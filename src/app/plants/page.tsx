import { createClientForBackend } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Leaf, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export default async function PlantsPage() {
  const supabase = await createClientForBackend()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("tb01_perfis").select("*").eq("tb01_id", user.id).maybeSingle()

  const { data: plants } = await supabase
    .from("tb02_plantas")
    .select("*")
    .eq("tb02_id_usuario", user.id)
    .order("tb02_data_criacao", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50">
      {/* Header */}
      <header className="border-b border-primary/20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/search">
                <Search className="h-4 w-4" />
              </Link>
            </Button>
            <Link href={`/profile/${user.id}`}>
              <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 ring-accent">
                <AvatarImage src={profile?.tb01_avatar_url || undefined} />
                <AvatarFallback className="bg-accent/10 text-accent">
                  {profile?.tb01_nome?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-primary">Minhas Plantas</h2>
            <p className="text-primary/70 mt-1">{plants?.length || 0} plantas cadastradas</p>
          </div>
          <Button asChild className="bg-accent hover:bg-accent/90">
            <Link href="/plants/new">
              <Plus className="h-4 w-4 mr-2" />
              Nova Planta
            </Link>
          </Button>
        </div>

        {plants && plants.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plants.map((plant) => (
              <Card key={plant.tb02_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/plants/${plant.tb02_id}`}>
                  <div className="aspect-square bg-primary/5 relative">
                    {plant.tb02_url_imagem ? (
                      <img
                        src={plant.tb02_url_imagem || "/placeholder.svg"}
                        alt={plant.tb02_apelido || plant.tb02_especie}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="h-16 w-16 text-primary/20" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-primary truncate">{plant.tb02_apelido || plant.tb02_especie}</h4>
                    <p className="text-sm text-muted-foreground truncate">{plant.tb02_especie}</p>
                    <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                      <span>Rega: {plant.tb02_frequencia_rega}d</span>
                      {plant.tb02_frequencia_sol && <span>• Sol: {plant.tb02_frequencia_sol}</span>}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Leaf className="h-16 w-16 text-primary/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">Nenhuma planta cadastrada</h3>
              <p className="text-muted-foreground mb-6">Comece cadastrando seu primeiro bonsai</p>
              <Button asChild className="bg-accent hover:bg-accent/90">
                <Link href="/plants/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar primeira planta
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}