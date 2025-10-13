// src/components/layout/Header.tsx

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import { Logo } from "@/components/ui/logo"

// Tipos do Supabase
import type { User } from "@supabase/supabase-js"

// 🔹 Tipagem das props que o Header vai receber
interface HeaderProps {
  user: User | null
  profile?: {
    tb01_avatar_url?: string | null
    tb01_nome?: string | null
  } | null
}

export function Header({ user, profile }: HeaderProps) {
  return (
    <header className="header border-b border-primary/20 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* 🔹 Logo padronizada */}
        <Link href="/dashboard">
          <Logo size="md" />
        </Link>

        {/* 🔹 Ações à direita */}
        <div className="flex items-center gap-3">
          {/* Botão de busca */}
          <Button asChild variant="ghost" size="sm">
            <Link href="/search">
              <Search className="h-4 w-4" />
            </Link>
          </Button>

          {/* Avatar do usuário */}
          {user && (
            <Link href={`/profile/${user.id}`}>
              <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 ring-accent">
                <AvatarImage src={profile?.tb01_avatar_url || undefined} />
                <AvatarFallback className="bg-accent/10 text-accent">
                  {profile?.tb01_nome?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
