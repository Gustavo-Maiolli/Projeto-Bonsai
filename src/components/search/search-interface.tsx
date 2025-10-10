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

interface SearchInterfaceProps {
  initialQuery: string
  initialType: string
  initialUsers: any[]
  initialPlants: any[]
  initialPosts: any[]
  currentUserId: string
}

export function SearchInterface({
  initialQuery,
  initialType,
  initialUsers,
  initialPlants,
  initialPosts,
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
                placeholder="Buscar usuários, plantas ou posts..."
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
              <TabsTrigger value="plants">Plantas ({initialPlants.length})</TabsTrigger>
              <TabsTrigger value="posts">Posts ({initialPosts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6 mt-6">
              {/* Users Section */}
              {initialUsers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3">Usuários</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {initialUsers.slice(0, 4).map((user) => (
                      <Link key={user.id} href={`/profile/${user.id}`}>
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4 flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {user.display_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-emerald-900 truncate">{user.display_name}</p>
                              {user.bio && <p className="text-sm text-muted-foreground truncate">{user.bio}</p>}
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

              {/* Plants Section */}
              {initialPlants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3">Plantas</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {initialPlants.slice(0, 6).map((plant) => (
                      <Link key={plant.id} href={`/plants/${plant.id}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-square bg-emerald-100 relative">
                            {plant.image_url ? (
                              <img
                                src={plant.image_url || "/placeholder.svg"}
                                alt={plant.nickname || plant.species}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Leaf className="h-16 w-16 text-emerald-300" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-semibold text-emerald-900 truncate">
                              {plant.nickname || plant.species}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">{plant.species}</p>
                            <p className="text-xs text-muted-foreground mt-1">por {plant.profiles?.display_name}</p>
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

              {/* Posts Section */}
              {initialPosts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3">Posts</h3>
                  <div className="space-y-4">
                    {initialPosts.slice(0, 3).map((post) => (
                      <PostCard key={post.id} post={post} currentUserId={currentUserId} />
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

            <TabsContent value="users" className="space-y-3 mt-6">
              {initialUsers.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {initialUsers.map((user) => (
                    <Link key={user.id} href={`/profile/${user.id}`}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">
                              {user.display_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-emerald-900 truncate">{user.display_name}</p>
                            {user.bio && <p className="text-sm text-muted-foreground truncate">{user.bio}</p>}
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

            <TabsContent value="plants" className="space-y-4 mt-6">
              {initialPlants.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {initialPlants.map((plant) => (
                    <Link key={plant.id} href={`/plants/${plant.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square bg-emerald-100 relative">
                          {plant.image_url ? (
                            <img
                              src={plant.image_url || "/placeholder.svg"}
                              alt={plant.nickname || plant.species}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Leaf className="h-16 w-16 text-emerald-300" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-semibold text-emerald-900 truncate">{plant.nickname || plant.species}</h4>
                          <p className="text-sm text-muted-foreground truncate">{plant.species}</p>
                          <p className="text-xs text-muted-foreground mt-1">por {plant.profiles?.display_name}</p>
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

            <TabsContent value="posts" className="space-y-4 mt-6">
              {initialPosts.length > 0 ? (
                initialPosts.map((post) => <PostCard key={post.id} post={post} currentUserId={currentUserId} />)
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
