"use client"

import { useState, useEffect } from "react"
import { createBrowserSupabaseClientForFrontend } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Droplet, Sun, Plus, Leaf } from "lucide-react"
import type { Plant, CareReminder } from "@/lib/types"
import { useRouter } from "next/navigation"

interface CalendarViewProps {
  plants: Plant[]
  initialReminders: CareReminder[]
  userId: string
}

export function CalendarView({ plants, initialReminders, userId }: CalendarViewProps) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [reminders, setReminders] = useState<CareReminder[]>(initialReminders)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    loadReminders()
  }, [currentDate])

  const loadReminders = async () => {
    const supabase = createBrowserSupabaseClientForFrontend()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const { data } = await supabase
      .from("care_reminders")
      .select("*, plants(*)")
      .eq("user_id", userId)
      .gte("reminder_date", startOfMonth.toISOString().split("T")[0])
      .lte("reminder_date", endOfMonth.toISOString().split("T")[0])

    if (data) {
      setReminders(data as CareReminder[])
    }
  }

  const generateReminders = async () => {
    const supabase = createBrowserSupabaseClientForFrontend()
    const today = new Date()
    const remindersToCreate: any[] = []

    for (const plant of plants) {
      const startDate = new Date(plant.start_date)

      // Generate watering reminders for next 60 days
      for (let i = 0; i < 60; i += plant.watering_frequency) {
        const reminderDate = new Date(today)
        reminderDate.setDate(today.getDate() + i)

        remindersToCreate.push({
          user_id: userId,
          plant_id: plant.id,
          reminder_date: reminderDate.toISOString().split("T")[0],
          reminder_type: "watering",
          completed: false,
        })
      }

      // Generate sun exposure reminders if configured
      if (plant.sun_frequency) {
        for (let i = 0; i < 60; i += plant.sun_frequency) {
          const reminderDate = new Date(today)
          reminderDate.setDate(today.getDate() + i)

          remindersToCreate.push({
            user_id: userId,
            plant_id: plant.id,
            reminder_date: reminderDate.toISOString().split("T")[0],
            reminder_type: "sun",
            completed: false,
          })
        }
      }
    }

    // Insert reminders (ignore conflicts)
    if (remindersToCreate.length > 0) {
      await supabase.from("care_reminders").upsert(remindersToCreate, {
        onConflict: "user_id,plant_id,reminder_date,reminder_type",
        ignoreDuplicates: true,
      })

      await loadReminders()
      router.refresh()
    }
  }

  const toggleReminder = async (reminderId: string, completed: boolean) => {
    const supabase = createBrowserSupabaseClientForFrontend()

    const { error } = await supabase
      .from("care_reminders")
      .update({
        completed: !completed,
        completed_at: !completed ? new Date().toISOString() : null,
      })
      .eq("id", reminderId)

    if (!error) {
      await loadReminders()
      router.refresh()
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const getRemindersForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return reminders.filter((r) => r.reminder_date === dateStr)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const selectedDateReminders = selectedDate ? getRemindersForDate(selectedDate) : []

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="capitalize">{monthName}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }

                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                const dateReminders = getRemindersForDate(date)
                const isToday = date.toDateString() === new Date().toDateString()
                const isSelected = selectedDate?.toDateString() === date.toDateString()

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square p-2 rounded-lg border transition-colors ${
                      isToday ? "border-emerald-600 bg-emerald-50" : "border-gray-200"
                    } ${isSelected ? "ring-2 ring-emerald-600" : ""} hover:bg-emerald-50`}
                  >
                    <div className="text-sm font-semibold text-emerald-900">{day}</div>
                    <div className="flex gap-1 justify-center mt-1">
                      {dateReminders.some((r) => r.reminder_type === "watering") && (
                        <Droplet
                          className={`h-3 w-3 ${
                            dateReminders.some((r) => r.reminder_type === "watering" && r.completed)
                              ? "text-emerald-600 fill-emerald-600"
                              : "text-blue-400"
                          }`}
                        />
                      )}
                      {dateReminders.some((r) => r.reminder_type === "sun") && (
                        <Sun
                          className={`h-3 w-3 ${
                            dateReminders.some((r) => r.reminder_type === "sun" && r.completed)
                              ? "text-emerald-600 fill-emerald-600"
                              : "text-yellow-400"
                          }`}
                        />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Legenda</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-blue-400" />
              <span className="text-sm">Rega pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-emerald-600 fill-emerald-600" />
              <span className="text-sm">Rega concluída</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">Sol pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-emerald-600 fill-emerald-600" />
              <span className="text-sm">Sol concluído</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={generateReminders} className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Gerar lembretes
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Gera lembretes automáticos para os próximos 60 dias baseado nas suas plantas
            </p>
          </CardContent>
        </Card>

        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate.toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateReminders.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateReminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                      <Checkbox
                        checked={reminder.completed}
                        onCheckedChange={() => toggleReminder(reminder.id, reminder.completed)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {reminder.reminder_type === "watering" ? (
                            <Droplet className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Sun className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="font-semibold text-sm text-emerald-900">
                            {reminder.reminder_type === "watering" ? "Regar" : "Colocar no sol"}
                          </span>
                        </div>
                        <p className="text-sm text-emerald-700">
                          {reminder.plants?.nickname || reminder.plants?.species}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum lembrete para este dia</p>
              )}
            </CardContent>
          </Card>
        )}

        {plants.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Leaf className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">Cadastre plantas para gerar lembretes</p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <a href="/plants/new">Cadastrar planta</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
