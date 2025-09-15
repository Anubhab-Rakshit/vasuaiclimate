import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const missionId = params.id

    // Check if mission exists
    const { data: mission, error: missionError } = await supabase
      .from("missions")
      .select("*")
      .eq("id", missionId)
      .single()

    if (missionError || !mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 })
    }

    // Check if user already has this mission
    const { data: existingMission } = await supabase
      .from("user_missions")
      .select("*")
      .eq("user_id", user.id)
      .eq("mission_id", missionId)
      .single()

    if (existingMission) {
      return NextResponse.json({ error: "Mission already started" }, { status: 400 })
    }

    // Start the mission
    const { data: userMission, error: insertError } = await supabase
      .from("user_missions")
      .insert({
        user_id: user.id,
        mission_id: missionId,
        status: "active",
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: "Failed to start mission" }, { status: 500 })
    }

    return NextResponse.json({ success: true, userMission })
  } catch (error) {
    console.error("Mission start error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
