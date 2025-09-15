"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          router.push("/auth/login?error=callback_error")
          return
        }

        if (session?.user) {
          // Check if profile exists, create if not
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          if (!profile) {
            // Create profile for new Google OAuth users
            const { error: profileError } = await supabase.from("profiles").insert({
              id: session.user.id,
              username: session.user.email?.split("@")[0] || "user",
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
              avatar_url: session.user.user_metadata?.avatar_url || null,
              level: 1,
              total_points: 0,
              carbon_footprint: 0,
              streak_days: 0,
            })

            if (profileError) {
              console.error("Profile creation error:", profileError)
            }
          }

          router.push("/dashboard")
        } else {
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        router.push("/auth/login?error=unexpected_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing your sign in...</p>
      </div>
    </div>
  )
}
