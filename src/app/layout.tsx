import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

import { createClientForBackend } from "@/lib/supabase/serverClient"
import { Header } from "@/components/layout/header"
import { headers } from "next/headers" // 🔹 Para detectar a rota no servidor

export const metadata: Metadata = {
  title: "Bonsai Care App",
  description: "TCC",
}

// ⚡ RootLayout roda no servidor, então não podemos usar usePathname() aqui diretamente.
// Para isso, usamos headers() e checamos o cabeçalho "x-invoke-path" (rota atual).
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 🔹 Cria cliente Supabase no backend
  const supabase = await createClientForBackend()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 🔹 Busca perfil do usuário se logado
  let profile = null
  if (user) {
    const { data: profileData } = await supabase
      .from("tb01_perfis")
      .select("tb01_nome, tb01_avatar_url")
      .eq("tb01_id", user.id)
      .single()

    profile = profileData
  }

  // 🔹 Detecta a rota atual no servidor (pois usePathname não funciona em Server Components)
  const headersList = headers()
  const currentPath = headersList.get("x-invoke-path") || headersList.get("referer") || "/"
  const isHomePage = currentPath === "/"

  // 🔸 Se estiver na home, ignora Header e estrutura de layout
  if (isHomePage) {
    return (
      <html lang="pt-BR">
        <body className="page-bg">
          <main>
            <Suspense fallback={null}>
              {children}
              <Toaster />
            </Suspense>
          </main>
          <Analytics />
        </body>
      </html>
    )
  }

  // 🔸 Caso contrário, aplica o layout completo com Header
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* ✅ Header global, com user e profile */}
        <Header user={user} profile={profile} />

        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={null}>
            {children}
            <Toaster />
          </Suspense>
        </main>

        <Analytics />
      </body>
    </html>
  )
}
