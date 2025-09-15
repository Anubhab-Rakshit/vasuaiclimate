import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const type = searchParams.get("type")

    let query = supabase.from("missions").select("*").order("created_at", { ascending: false })

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (difficulty && difficulty !== "all") {
      query = query.eq("difficulty", difficulty)
    }

    if (type && type !== "all") {
      query = query.eq("type", type)
    }

    const { data: missions, error } = await query

    if (error) {
      console.error("Error fetching missions:", error)
      return NextResponse.json({ error: "Failed to fetch missions" }, { status: 500 })
    }

    return NextResponse.json({ missions })
  } catch (error) {
    console.error("Error in missions API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
