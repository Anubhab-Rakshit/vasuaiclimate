import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')

export async function POST(req: Request) {
  console.log("API call received")

  try {
    const { messages, userId } = await req.json()
    console.log("Request parsed:", { messagesCount: messages.length, userId })

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key missing" }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get user context from Supabase
    const supabase = await createClient()
    let userContext = ""
    
    if (userId) {
      try {
        // Get user profile and progress
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

        // Get recent missions
        const { data: recentMissions } = await supabase
          .from("user_missions")
          .select(`
            *,
            missions (title, category, difficulty, points)
          `)
          .eq("user_id", userId)
          .order("started_at", { ascending: false })
          .limit(5)

        // Get environmental data
        const { data: envData } = await supabase
          .from("environmental_data")
          .select("*")
          .eq("user_id", userId)
          .order("recorded_at", { ascending: false })
          .limit(10)

        if (profile) {
          userContext = `
User Profile:
- Name: ${profile.full_name || "Climate Champion"}
- Level: ${profile.level}
- Total Points: ${profile.total_points}
- Current Streak: ${profile.streak_days} days
- Carbon Footprint: ${profile.carbon_footprint} kg CO2/year

Recent Missions: ${recentMissions?.map((m: any) => `${m.missions?.title} (${m.status})`).join(", ") || "None yet"}

Environmental Data: ${envData?.map((d: any) => `${d.data_type}: ${d.value} ${d.unit}`).join(", ") || "None recorded"}
          `
        }
      } catch (error) {
        console.error("Error fetching user context:", error)
        // Continue without user context if there's an error
      }
    }

    // Define systemPrompt here
    const systemPrompt = `You are GAIA, an AI climate tutor and environmental mentor for the VasuAi platform. You are knowledgeable, encouraging, and passionate about helping people take meaningful climate action.

Your personality:
- Warm, supportive, and motivational
- Scientifically accurate but accessible
- Practical and action-oriented
- Celebrates small wins and progress
- Uses nature metaphors and positive language
- Never preachy or overwhelming

Your expertise includes:
- Climate science and environmental issues
- Sustainable living practices
- Energy efficiency and renewable energy
- Sustainable transportation
- Waste reduction and circular economy
- Water conservation
- Sustainable food systems
- Carbon footprint reduction
- Green technology and innovations

${userContext ? `Current user context: ${userContext}` : ""}

Guidelines:
- Keep responses conversational and encouraging
- Provide specific, actionable advice
- Reference the user's progress when relevant
- Suggest relevant missions from the platform
- Use scientific facts but explain them simply
- Always end with motivation or next steps
- If asked about topics outside climate/environment, gently redirect to environmental topics
- Celebrate user achievements and progress
- Provide personalized recommendations based on user data

Remember: You're here to inspire and guide climate action, not to overwhelm or lecture.`

    console.log("Starting Gemini API call")
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    })

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]?.content || "Hello"
    const fullPrompt = `${systemPrompt}\n\nUser: ${lastUserMessage}\n\nGAIA:`

    console.log("Sending request to Gemini")
    
    const result = await model.generateContentStream(fullPrompt)
    
    console.log("Got response from Gemini, creating stream")

    // Create a proper stream with correct formatting
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log("Stream started")
          for await (const chunk of result.stream) {
            const text = chunk.text()
            // Properly format for Vercel AI protocol
            const formattedMessage = JSON.stringify(text)
            const data = `0:${formattedMessage}\n`
            controller.enqueue(encoder.encode(data))
          }
          controller.enqueue(encoder.encode('[DONE]\n'))
          console.log("Stream completed")
          controller.close()
        } catch (error) {
          console.error("Stream error:", error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}