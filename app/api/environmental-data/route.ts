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

    const { data: environmentalData, error } = await supabase
      .from("environmental_data")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching environmental data:", error)
      return NextResponse.json({ error: "Failed to fetch environmental data" }, { status: 500 })
    }

    return NextResponse.json({ environmentalData })
  } catch (error) {
    console.error("Error in environmental data API:", error)
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
    const { type, value, unit, date } = body

    const { data: environmentalData, error } = await supabase
      .from("environmental_data")
      .insert({
        user_id: user.id,
        type,
        value,
        unit,
        date: date || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating environmental data:", error)
      return NextResponse.json({ error: "Failed to create environmental data" }, { status: 500 })
    }

    return NextResponse.json({ environmentalData })
  } catch (error) {
    console.error("Error in environmental data API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
