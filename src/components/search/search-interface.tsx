"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Leaf, User } from "lucide-react"
import Link from "next/link"
import { PostCard } from "@/components/feed/post-card"

// Atualizando a interface para refletir a nomenclatura das tabelas
interface SearchInterfaceProps {
  initialQuery: string
  initialType: string
  initialUsers: any[] // tb01_perfis
  initialPlants: any[] // tb02_plantas
  initialPosts: any[] // tb03_publicacoes
  currentUserId: string
}

export function SearchInterface({
  initialQuery,
  initialType,
  initialUsers,
  initialPlants, // Renomeado de initialtb02_plantas
  initialPosts, // Renomeado de initialtb03_publicacoes
  currentUserId,
}: SearchInterfaceProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [searchType, setSearchType] = useState(initialType)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${searchType}`)
    }
  }

  const handleTabChange = (value: string) => {
    setSearchType(value)
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${value}`)
    }
  }

  // Corrigindo o cálculo de totalResults
  const totalResults = initialUsers.length + initialPlants.length + initialPosts.length

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                // Atualizando a string placeholder
                placeholder="Buscar usuários, plantas ou publicações..."
                className="pl-10"
              />
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {initialQuery && (
        <>
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Resultados para "{initialQuery}"</h2>
            <p className="text-muted-foreground">{totalResults} resultados encontrados</p>
          </div>

          <Tabs value={searchType} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todos ({totalResults})</TabsTrigger>
              <TabsTrigger value="users">Usuários ({initialUsers.length})</TabsTrigger>
              {/* Usando os nomes das variáveis corretas */}
              <TabsTrigger value="plants">Plantas ({initialPlants.length})</TabsTrigger>
              <TabsTrigger value="posts">Posts ({initialPosts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6 mt-6">
              {/* Users Section (tb01_perfis) */}
              {initialUsers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3">Usuários</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {initialUsers.slice(0, 4).map((user) => (
                      // Assumindo que user.tb01_id e outras chaves estão sendo usadas corretamente no contexto mais amplo
                      <Link key={user.tb01_id || user.id} href={`/profile/${user.tb01_id || user.id}`}>
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4 flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              {/* Assumindo que avatar_url é user.tb01_url_avatar */}
                              <AvatarImage src={user.tb01_url_avatar || undefined} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {/* Assumindo que display_name é user.tb01_nome_exibicao */}
                                {user.tb01_nome_exibicao.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              {/* Assumindo que display_name é user.tb01_nome_exibicao */}
                              <p className="font-semibold text-emerald-900 truncate">{user.tb01_nome_exibicao}</p>
                              {/* Assumindo que bio é user.tb01_biografia */}
                              {user.tb01_biografia && <p className="text-sm text-muted-foreground truncate">{user.tb01_biografia}</p>}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  {initialUsers.length > 4 && (
                    <Button
                      variant="outline"
                      className="w-full mt-3 bg-transparent"
                      onClick={() => handleTabChange("users")}
                    >
                      Ver todos os usuários
                    </Button>
                  )}
                </div>
              )}

              {/* Plants Section (tb02_plantas) */}
              {initialPlants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3">Plantas</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {initialPlants.slice(0, 6).map((plant) => (
                      // Assumindo que o ID é plant.tb02_id
                      <Link key={plant.tb02_id} href={`/plants/${plant.tb02_id}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-square bg-emerald-100 relative">
                            {/* Assumindo chaves tb02_ */}
                            {plant.tb02_url_imagem ? (
                              <img
                                src={plant.tb02_url_imagem || "/placeholder.svg"}
                                alt={plant.tb02_apelido || plant.tb02_especie}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Leaf className="h-16 w-16 text-emerald-300" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-3">
                            {/* Assumindo chaves tb02_ */}
                            <h4 className="font-semibold text-emerald-900 truncate">
                              {plant.tb02_apelido || plant.tb02_especie}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">{plant.tb02_especie}</p>
                            {/* Assumindo que a relação 'profiles' (tb01_perfis) está sendo carregada no backend */}
                            <p className="text-xs text-muted-foreground mt-1">por {plant.profiles?.tb01_nome_exibicao}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  {initialPlants.length > 6 && (
                    <Button
                      variant="outline"
                      className="w-full mt-3 bg-transparent"
                      onClick={() => handleTabChange("plants")}
                    >
                      Ver todas as plantas
                    </Button>
                  )}
                </div>
              )}

              {/* Posts Section (tb03_publicacoes) */}
              {initialPosts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3">Posts</h3>
                  <div className="space-y-4">
                    {/* PostCard usa a chave 'post' que deve vir corretamente formatada do backend */}
                    {initialPosts.slice(0, 3).map((post) => (
                      // Assumindo que post.tb03_id é o ID
                      <PostCard key={post.tb03_id} post={post} currentUserId={currentUserId} />
                    ))}
                  </div>
                  {initialPosts.length > 3 && (
                    <Button
                      variant="outline"
                      className="w-full mt-3 bg-transparent"
                      onClick={() => handleTabChange("posts")}
                    >
                      Ver todos os posts
                    </Button>
                  )}
                </div>
              )}

              {totalResults === 0 && (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Search className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-emerald-900 mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-muted-foreground">Tente buscar por outros termos</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Abas individuais: Usuários */}
            <TabsContent value="users" className="space-y-3 mt-6">
              {initialUsers.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {initialUsers.map((user) => (
                    // Assumindo que user.tb01_id é o ID
                    <Link key={user.tb01_id} href={`/profile/${user.tb01_id}`}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                             {/* Assumindo que avatar_url é user.tb01_url_avatar */}
                            <AvatarImage src={user.tb01_url_avatar || undefined} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">
                              {/* Assumindo que display_name é user.tb01_nome_exibicao */}
                              {user.tb01_nome_exibicao.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            {/* Assumindo que display_name é user.tb01_nome_exibicao */}
                            <p className="font-semibold text-emerald-900 truncate">{user.tb01_nome_exibicao}</p>
                            {/* Assumindo que bio é user.tb01_biografia */}
                            {user.tb01_biografia && <p className="text-sm text-muted-foreground truncate">{user.tb01_biografia}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <User className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Abas individuais: Plantas */}
            <TabsContent value="plants" className="space-y-4 mt-6">
              {initialPlants.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {initialPlants.map((plant) => (
                    // Assumindo que o ID é plant.tb02_id
                    <Link key={plant.tb02_id} href={`/plants/${plant.tb02_id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square bg-emerald-100 relative">
                           {/* Assumindo chaves tb02_ */}
                          {plant.tb02_url_imagem ? (
                            <img
                              src={plant.tb02_url_imagem || "/placeholder.svg"}
                              alt={plant.tb02_apelido || plant.tb02_especie}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Leaf className="h-16 w-16 text-emerald-300" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                           {/* Assumindo chaves tb02_ */}
                          <h4 className="font-semibold text-emerald-900 truncate">{plant.tb02_apelido || plant.tb02_especie}</h4>
                          <p className="text-sm text-muted-foreground truncate">{plant.tb02_especie}</p>
                           {/* Assumindo que a relação 'profiles' (tb01_perfis) está sendo carregada no backend */}
                          <p className="text-xs text-muted-foreground mt-1">por {plant.profiles?.tb01_nome_exibicao}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Leaf className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma planta encontrada</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Abas individuais: Posts */}
            <TabsContent value="posts" className="space-y-4 mt-6">
              {initialPosts.length > 0 ? (
                // PostCard usa a chave 'post' que deve vir corretamente formatada do backend
                initialPosts.map((post) => <PostCard key={post.tb03_id} post={post} currentUserId={currentUserId} />)
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Search className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum post encontrado</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {!initialQuery && (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">Buscar na comunidade</h3>
            <p className="text-muted-foreground">Encontre usuários, plantas e posts sobre bonsais</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}