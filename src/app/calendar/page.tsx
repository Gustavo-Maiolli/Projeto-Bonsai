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

  const { data: profile } = await supabase.from("tb01_perfis").select("*").eq("id", user.id).single()

  // Fetch user's plants
  const { data: plants } = await supabase.from("tb02_plantas").select("*").eq("user_id", user.id)

  // Fetch reminders for the current month
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const { data: reminders } = await supabase
    .from("tb06_lembretes_cuidado")
    .select("*, plants(*)")
    .eq("user_id", user.id)
    .gte("reminder_date", startOfMonth.toISOString().split("T")[0])
    .lte("reminder_date", endOfMonth.toISOString().split("T")[0])

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
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-accent/10 text-accent">
                  {profile?.display_name.charAt(0).toUpperCase()}
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

        <CalendarView plants={plants || []} initialReminders={reminders || []} userId={user.id} />
      </div>
    </div>
  )
}
