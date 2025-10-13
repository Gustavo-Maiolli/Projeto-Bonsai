import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

// 👈 ADICIONAR IMPORTS
import { createClientForBackend } from "@/lib/supabase/serverClient"
import { Header } from "@/components/layout/header"

export const metadata: Metadata = {
  title: "Bonsai Care App",
  description: "TCC",
}

// 👈 TRANSFORMAR EM 'async'
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  // 🚀 BUSCAR DADOS AQUI
  const supabase = await createClientForBackend()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data: profileData } = await supabase
      .from("tb01_perfis")
      .select("tb01_nome, tb01_avatar_url")
      .eq("tb01_id", user.id)
      .single()
    profile = profileData
  }

  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* ✨ RENDERIZAR O HEADER AQUI */}
        <Header user={user} profile={profile} />

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