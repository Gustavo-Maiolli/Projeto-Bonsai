import { createClientForBackend } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Leaf, Plus, Calendar, Search } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export default async function DashboardPage() {
    const supabase = await createClientForBackend()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: profile } = await supabase
        .from("tb01_perfis")
        .select("*")
        .eq("tb01_id", user.id)
        .maybeSingle()
    
    // --- INÍCIO DO DIAGNÓSTICO OBRIGATÓRIO NO SERVIDOR ---
    console.log("\n--- DIAGNÓSTICO DE ERRO DE VISUALIZAÇÃO ---");
    console.log(`[USER ID] O ID do usuário logado é: ${user.id}`);
    console.log(`[QUERY] Tentando buscar plantas para o ID: ${user.id}`);
    // --- FIM DO DIAGNÓSTICO OBRIGATÓRIO NO SERVIDOR ---

    // Este filtro é a solução de força para contornar o RLS.
    // Se ainda falhar, o problema é o user.id acima.
    const { data: tb02_plantas, error } = await supabase
        .from("tb02_plantas")
        .select("*")
        .eq("tb02_id_usuario", user.id) // FILTRO PRESENTE
        .order("tb02_criado_em", { ascending: false })
        .limit(6)
    
    // --- RESULTADO DO DIAGNÓSTICO NO SERVIDOR ---
    if (error) {
        console.error("[ERRO SUPABASE]", error);
    }
    console.log(`[RESULTADO] Plantas encontradas: ${tb02_plantas?.length || 0}`);
    console.log("---------------------------------------------\n");


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
                                    {profile?.tb01_nome?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-primary mb-2">Olá, {profile?.tb01_nome || "Usuário"}!</h2>
                    <p className="text-primary/70">Bem-vindo ao seu painel de cuidados com bonsais</p>
                </div>

                {/* Quick Actions */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href="/plants/new">
                            <CardContent className="pt-6 text-center">
                                <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Plus className="h-6 w-6 text-accent" />
                                </div>
                                <h3 className="font-semibold text-primary">Nova Planta</h3>
                                <p className="text-sm text-muted-foreground mt-1">Cadastrar bonsai</p>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href="/plants">
                            <CardContent className="pt-6 text-center">
                                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Leaf className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-primary">Minhas Plantas</h3>
                                <p className="text-sm text-muted-foreground mt-1">{tb02_plantas?.length || 0} plantas</p>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href="/calendar">
                            <CardContent className="pt-6 text-center">
                                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="h-6 w-6 text-amber-600" />
                                </div>
                                <h3 className="font-semibold text-primary">Calendário</h3>
                                <p className="text-sm text-muted-foreground mt-1">Ver lembretes</p>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href="/feed">
                            <CardContent className="pt-6 text-center">
                                <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Search className="h-6 w-6 text-accent" />
                                </div>
                                <h3 className="font-semibold text-primary">Feed Social</h3>
                                <p className="text-sm text-muted-foreground mt-1">Ver comunidade</p>
                            </CardContent>
                        </Link>
                    </Card>
                </div>

                {/* Plantas Recentes */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-primary">Plantas Recentes</h3>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/plants">Ver todas</Link>
                        </Button>
                    </div>

                    {tb02_plantas && tb02_plantas.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tb02_plantas.map((plant) => (
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
                                            <h4 className="font-semibold text-primary">{plant.tb02_apelido || plant.tb02_especie}</h4>
                                            <p className="text-sm text-muted-foreground">{plant.tb02_especie}</p>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Leaf className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                                <p className="text-muted-foreground mb-4">Você ainda não cadastrou nenhuma planta</p>
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
        </div>
    )
}
