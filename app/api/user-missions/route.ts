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

    const { data: userMissions, error } = await supabase
      .from("user_missions")
      .select(`
        *,
        missions (*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user missions:", error)
      return NextResponse.json({ error: "Failed to fetch user missions" }, { status: 500 })
    }

    return NextResponse.json({ userMissions })
  } catch (error) {
    console.error("Error in user missions API:", error)
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
    const { mission_id, action } = body

    if (action === "start") {
      const { data: userMission, error } = await supabase
        .from("user_missions")
        .insert({
          user_id: user.id,
          mission_id,
          status: "in_progress",
          progress: 0,
        })
        .select()
        .single()

      if (error) {
        console.error("Error starting mission:", error)
        return NextResponse.json({ error: "Failed to start mission" }, { status: 500 })
      }

      return NextResponse.json({ userMission })
    }

    if (action === "complete") {
      const { verification_photo } = body

      const { data: userMission, error } = await supabase
        .from("user_missions")
        .update({
          status: "completed",
          progress: 100,
          completed_at: new Date().toISOString(),
          verification_photo,
        })
        .eq("user_id", user.id)
        .eq("mission_id", mission_id)
        .select()
        .single()

      if (error) {
        console.error("Error completing mission:", error)
        return NextResponse.json({ error: "Failed to complete mission" }, { status: 500 })
      }

      // Award points to user
      const { data: mission } = await supabase.from("missions").select("points").eq("id", mission_id).single()

      if (mission) {
        await supabase.rpc("add_user_points", {
          user_id: user.id,
          points: mission.points,
        })
      }

      return NextResponse.json({ userMission })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in user missions API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
