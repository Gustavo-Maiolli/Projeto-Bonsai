"use client"

import { useEffect, useState } from "react"
import { createBrowserSupabaseClientForFrontend } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createBrowserSupabaseClientForFrontend()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from("tb01_perfis")
        .select("*")
        .eq("tb01_id", user.id)
        .maybeSingle()

      setProfile(profile || null)
      setLoading(false)
    }

    fetchData()
  }, [])

  return { user, profile, loading }
}
