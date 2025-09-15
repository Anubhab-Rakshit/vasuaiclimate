"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import {
  User,
  Trophy,
  Target,
  Calendar,
  Award,
  Zap,
  Leaf,
  Camera,
  Download,
  Edit,
  Save,
  X,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  level: number
  total_points: number
  carbon_footprint: number
  streak_days: number
  created_at: string
}

interface Achievement {
  id: string
  title: string
  description: string
  badge_type: string
  earned_at: string
}

interface UserMission {
  id: string
  status: string
  completed_at: string | null
  missions: {
    title: string
    category: string
    points: number
  }
}

interface Goal {
  id: string
  title: string
  target_value: number
  current_value: number
  unit: string
  deadline: string
  status: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userMissions, setUserMissions] = useState<UserMission[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({})
  const [activeTab, setActiveTab] = useState("overview")

  const supabase = createClient()
  const router = useRouter()

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
      await fetchProfileData(user.id)
      setIsLoading(false)
    }
    getUser()
  }, [router, supabase.auth])

  const fetchProfileData = async (userId: string) => {
    // Fetch profile
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (profileData) {
      setProfile(profileData)
      setEditedProfile(profileData)
    }

    // Fetch achievements
    const { data: achievementsData } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })

    if (achievementsData) {
      setAchievements(achievementsData)
    }

    // Fetch user missions
    const { data: missionsData } = await supabase
      .from("user_missions")
      .select(`
        *,
        missions (title, category, points)
      `)
      .eq("user_id", userId)
      .order("started_at", { ascending: false })

    if (missionsData) {
      setUserMissions(missionsData)
    }

    // Mock goals data (in real app, this would come from database)
    setGoals([
      {
        id: "1",
        title: "Reduce Carbon Footprint",
        target_value: 500,
        current_value: 320,
        unit: "kg CO₂",
        deadline: "2024-12-31",
        status: "active",
      },
      {
        id: "2",
        title: "Complete 20 Missions",
        target_value: 20,
        current_value: missionsData?.filter((m) => m.status === "completed").length || 0,
        unit: "missions",
        deadline: "2024-06-30",
        status: "active",
      },
      {
        id: "3",
        title: "Save 1000 kWh Energy",
        target_value: 1000,
        current_value: 650,
        unit: "kWh",
        deadline: "2024-09-30",
        status: "active",
      },
    ])
  }

  const saveProfile = async () => {
    if (!user || !editedProfile) return

    const { error } = await supabase.from("profiles").update(editedProfile).eq("id", user.id)

    if (!error) {
      setProfile({ ...profile, ...editedProfile } as Profile)
      setIsEditing(false)
    }
  }

  const calculateLevel = (points: number) => {
    return Math.floor(points / 100) + 1
  }

  const getNextLevelPoints = (currentPoints: number) => {
    const currentLevel = calculateLevel(currentPoints)
    return currentLevel * 100
  }

  const getLevelProgress = (points: number) => {
    const levelPoints = points % 100
    return levelPoints
  }

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case "bronze":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "silver":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "platinum":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getActivityData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        missions: Math.floor(Math.random() * 3),
        points: Math.floor(Math.random() * 50),
      }
    })
    return last30Days
  }

  const getCategoryStats = () => {
    const categories = userMissions.reduce(
      (acc, mission) => {
        const category = mission.missions?.category || "other"
        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categories).map(([name, value]) => ({ name, value }))
  }

  const exportReport = () => {
    const reportData = {
      profile: profile,
      achievements: achievements,
      missions: userMissions,
      goals: goals,
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vasuai-impact-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const activityData = getActivityData()
  const categoryData = getCategoryStats()
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

  const completedMissions = userMissions.filter((m) => m.status === "completed")
  const totalPoints = completedMissions.reduce((sum, m) => sum + (m.missions?.points || 0), 0)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">Unable to load your profile data.</p>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
              <p className="text-gray-600">Track your progress and achievements</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={exportReport}
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl">
                      {profile.full_name?.[0] || profile.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{profile.full_name || profile.username}</h2>
                  <p className="text-gray-600 mb-4">@{profile.username}</p>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Badge className="bg-emerald-100 text-emerald-800 px-3 py-1">Level {profile.level}</Badge>
                    <Badge variant="outline" className="px-3 py-1">
                      {profile.total_points} points
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Level Progress</span>
                      <span>{getLevelProgress(profile.total_points)}/100</span>
                    </div>
                    <Progress value={getLevelProgress(profile.total_points)} className="h-2" />
                    <p className="text-xs text-gray-500">
                      {100 - getLevelProgress(profile.total_points)} points to Level {profile.level + 1}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{completedMissions.length}</p>
                        <p className="text-sm text-gray-600">Missions Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
                        <p className="text-sm text-gray-600">Achievements</p>
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
                        <p className="text-2xl font-bold text-gray-900">{profile.streak_days}</p>
                        <p className="text-sm text-gray-600">Day Streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{profile.carbon_footprint.toFixed(1)}</p>
                        <p className="text-sm text-gray-600">kg CO₂ Saved</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={activityData.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="points" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    Mission Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Your Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-full ${getBadgeColor(achievement.badge_type)}`}>
                            <Trophy className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                            <Badge className={getBadgeColor(achievement.badge_type)} variant="outline">
                              {achievement.badge_type}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <p className="text-xs text-gray-500">
                          Earned: {new Date(achievement.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
                    <p className="text-gray-600 mb-6">Complete missions and reach milestones to earn achievements!</p>
                    <Button
                      onClick={() => router.push("/missions")}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      Start Your First Mission
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  Your Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                        <Badge
                          className={
                            goal.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }
                        >
                          {goal.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {goal.current_value} / {goal.target_value} {goal.unit}
                          </span>
                        </div>
                        <Progress value={(goal.current_value / goal.target_value) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{((goal.current_value / goal.target_value) * 100).toFixed(1)}% complete</span>
                          <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userMissions.slice(0, 10).map((mission) => (
                    <div key={mission.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {mission.status === "completed" ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Clock className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{mission.missions?.title}</h4>
                        <p className="text-sm text-gray-600 capitalize">{mission.missions?.category} mission</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            mission.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }
                        >
                          {mission.status}
                        </Badge>
                        {mission.completed_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(mission.completed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    Profile Settings
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={saveProfile}
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false)
                          setEditedProfile(profile)
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xl">
                      {profile.full_name?.[0] || profile.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Avatar
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={editedProfile.full_name || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editedProfile.username || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself and your climate goals..."
                    rows={3}
                    disabled={!isEditing}
                  />
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-4">Account Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{profile.level}</p>
                      <p className="text-sm text-gray-600">Current Level</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{profile.total_points}</p>
                      <p className="text-sm text-gray-600">Total Points</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{profile.streak_days}</p>
                      <p className="text-sm text-gray-600">Current Streak</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">Member Since</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
