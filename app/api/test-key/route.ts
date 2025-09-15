// app/api/test-key/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const result = await model.generateContent("Hello, who are you?")
    const response = await result.response
    const text = response.text()
    
    return new Response(JSON.stringify({ success: true, response: text }))
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "exists" : "missing" 
    }))
  }
}