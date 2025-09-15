import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userAchievements, error } = await supabase
      .from("user_achievements")
      .select(`
        *,
        achievements (*)
      `)
      .eq("user_id", user.id)
      .order("unlocked_at", { ascending: false })

    if (error) {
      console.error("Error fetching user achievements:", error)
      return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
    }

    return NextResponse.json({ userAchievements })
  } catch (error) {
    console.error("Error in achievements API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { achievement_id } = body

    const { data: userAchievement, error } = await supabase
      .from("user_achievements")
      .insert({
        user_id: user.id,
        achievement_id,
        unlocked_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error unlocking achievement:", error)
      return NextResponse.json({ error: "Failed to unlock achievement" }, { status: 500 })
    }

    return NextResponse.json({ userAchievement })
  } catch (error) {
    console.error("Error in achievements API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
