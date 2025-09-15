import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GAIAWidget } from "@/components/gaia-widget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Leaf, Target, Trophy, TrendingUp, MessageCircle, Calendar, Users, Zap } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user missions
  const { data: userMissions } = await supabase
    .from("user_missions")
    .select(`
      *,
      missions (title, category, difficulty, points)
    `)
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(5)

  // Get recent environmental data
  const { data: envData } = await supabase
    .from("environmental_data")
    .select("*")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: false })
    .limit(3)

  const completedMissions = userMissions?.filter((m) => m.status === "completed").length || 0
  const activeMissions = userMissions?.filter((m) => m.status === "active").length || 0
  const levelProgress = (profile?.total_points || 0) % 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile?.full_name || "Climate Champion"}!
              </h1>
              <p className="text-gray-600">Ready to make a positive impact today?</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                Level {profile?.level || 1}
              </Badge>
              <Button
                asChild
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <Link href="/chat">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with GAIA
                </Link>
              </Button>
            </div>
          </div>

          {/* Level Progress */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Level Progress</span>
                <span className="text-sm text-gray-500">{profile?.total_points || 0} points</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {100 - levelProgress} points to Level {(profile?.level || 1) + 1}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedMissions}</p>
                  <p className="text-sm text-gray-600">Missions Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{activeMissions}</p>
                  <p className="text-sm text-gray-600">Active Missions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{profile?.streak_days || 0}</p>
                  <p className="text-sm text-gray-600">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{profile?.carbon_footprint || 0}</p>
                  <p className="text-sm text-gray-600">kg CO₂ Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Missions */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  Your Active Missions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userMissions && userMissions.length > 0 ? (
                  <div className="space-y-4">
                    {userMissions.slice(0, 3).map((mission) => (
                      <div key={mission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{mission.missions?.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {mission.missions?.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {mission.missions?.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-500">{mission.missions?.points} points</span>
                          </div>
                        </div>
                        <Badge
                          variant={mission.status === "completed" ? "default" : "secondary"}
                          className={mission.status === "completed" ? "bg-emerald-100 text-emerald-800" : ""}
                        >
                          {mission.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No missions yet! Start your climate journey.</p>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      <Link href="/missions">Browse Missions</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/missions">
                    <Target className="w-4 h-4 mr-2" />
                    Browse Missions
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/environmental-data">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Track Data
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/community">
                    <Users className="w-4 h-4 mr-2" />
                    Community
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/profile">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Environmental Impact */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {envData && envData.length > 0 ? (
                  <div className="space-y-3">
                    {envData.map((data) => (
                      <div key={data.id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{data.data_type.replace("_", " ")}</span>
                        <span className="text-sm font-medium">
                          {data.value} {data.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">Start tracking your environmental impact!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* GAIA Widget */}
      <GAIAWidget userLevel={profile?.level} />
    </div>
  )
}
