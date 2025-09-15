import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const location = searchParams.get("location")

    let query = supabase.from("environmental_groups").select("*").order("created_at", { ascending: false })

    if (location) {
      query = query.ilike("location", `%${location}%`)
    }

    const { data: groups, error } = await query

    if (error) {
      console.error("Error fetching groups:", error)
      return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
    }

    return NextResponse.json({ groups })
  } catch (error) {
    console.error("Error in groups API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
