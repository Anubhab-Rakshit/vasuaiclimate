"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles, MessageCircle, X } from "lucide-react"
import Link from "next/link"

interface GAIAWidgetProps {
  userLevel?: number
  recentActivity?: string
}

export function GAIAWidget({ userLevel = 1, recentActivity }: GAIAWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const dailyTips = [
    "Did you know? Switching to LED bulbs can reduce your lighting energy use by 75%!",
    "Small action, big impact: Unplugging devices when not in use can save 10% on your energy bill.",
    "Today's tip: Try a plant-based meal! It can reduce your carbon footprint by up to 2.5kg CO2.",
    "Water wisdom: A 5-minute shower uses about 25 gallons less water than a bath.",
    "Green transport: Walking or biking for trips under 2 miles is great for you and the planet!",
  ]

  const getPersonalizedMessage = () => {
    if (userLevel >= 5) {
      return "You're becoming a true climate champion! Ready for your next challenge?"
    } else if (userLevel >= 3) {
      return "Great progress on your climate journey! Let's keep the momentum going."
    } else {
      return "Welcome to your climate adventure! I'm here to guide you every step of the way."
    }
  }

  const randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)]

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                G
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">GAIA</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">Your AI Climate Tutor</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-100">
              <p className="text-sm text-gray-700 font-medium mb-1">Daily Climate Tip</p>
              <p className="text-xs text-gray-600 leading-relaxed">{randomTip}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 leading-relaxed">{getPersonalizedMessage()}</p>
            </div>

            <div className="flex gap-2">
              <Button
                asChild
                size="sm"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs"
              >
                <Link href="/chat">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Chat Now
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs"
              >
                Later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
