"use client"

import { useChat } from "ai/react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Send, Sparkles, Leaf } from "lucide-react"
import { useRouter } from "next/navigation"


export default function ChatPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const {
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading: isChatLoading,
} = useChat({
  api: "/api/chat",
  onResponse: (response) => {
    console.log("Response received:", response.status)
  },
  onError: (error) => {
    console.error("Chat error:", error)
  },
  onFinish: (message) => {
    console.log("Message finished:", message)
  },
})

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      setIsLoading(false)
    }
    getUser()
  }, [router, supabase.auth])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  const quickPrompts = [
    "How can I reduce my carbon footprint?",
    "What missions should I start with?",
    "Tips for sustainable living",
    "Help me save energy at home",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Chat with GAIA</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your personal AI climate tutor is here to guide you on your environmental journey with expert advice and
            personalized recommendations.
          </p>
        </div>

        {/* Chat Container */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                  G
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg text-gray-900">GAIA</CardTitle>
                <p className="text-sm text-gray-500">AI Climate Tutor</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Online</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                        G
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarFallback className="bg-gray-600 text-white text-sm">
                        {user?.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isChatLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                      G
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      <span className="text-sm text-gray-600">GAIA is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-600 mb-3">Try asking GAIA about:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto py-2 px-3 text-xs border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent"
                      onClick={() => {
                        handleInputChange({ target: { value: prompt } } as any)
                      }}
                    >
                      <Leaf className="w-3 h-3 mr-2 text-emerald-600" />
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="border-t border-gray-100 p-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask GAIA about climate action, sustainability tips, or missions..."
                  className="flex-1 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={isChatLoading}
                />
                <Button
                  type="submit"
                  disabled={isChatLoading || !input.trim()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
