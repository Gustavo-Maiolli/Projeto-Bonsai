import { createClientForBackend } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import Link from "next/link"
import { CalendarView } from "@/components/calendar/calendar-view"
import { Logo } from "@/components/ui/logo"

export default async function CalendarPage() {
  const supabase = await createClientForBackend()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("tb01_perfis").select("*").eq("tb01_id", user.id).single()

  const { data: tb02_plantas } = await supabase.from("tb02_plantas").select("*").eq("tb02_id_usuario", user.id)

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const { data: reminders } = await supabase
    .from("tb06_lembretes_cuidado")
    .select("*, tb02_plantas(*)")
    .eq("tb06_id_usuario", user.id) 
    .gte("tb06_data_lembrete", startOfMonth.toISOString().split("T")[0])
    .lte("tb06_data_lembrete", endOfMonth.toISOString().split("T")[0])

  return (
    <div className="page-bg">
      {/* Header */}
      <header className="header">
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
                  {profile?.tb01_nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-primary">Calendário de Cuidados</h2>
          <p className="text-primary/70 mt-1">Gerencie os lembretes de rega e exposição ao sol</p>
        </div>

        <CalendarView tb02_plantas={tb02_plantas || []} initialReminders={reminders || []} userId={user.id} />
      </div>
    </div>
  )
}