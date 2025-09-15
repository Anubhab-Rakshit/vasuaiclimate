"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import {
  Target,
  Zap,
  Car,
  Trash2,
  Droplets,
  Utensils,
  Trophy,
  Clock,
  Star,
  Search,
  Play,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Mission {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  points: number
  duration_days: number
  created_at: string
}

interface UserMission {
  id: string
  mission_id: string
  status: string
  progress: number
  started_at: string
  completed_at: string | null
  photo_url: string | null
  missions: Mission
}

export default function MissionsPage() {
  const [user, setUser] = useState<any>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [userMissions, setUserMissions] = useState<UserMission[]>([])
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("browse")

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
      await fetchMissions()
      await fetchUserMissions(user.id)
      setIsLoading(false)
    }
    getUser()
  }, [router, supabase.auth])

  useEffect(() => {
    filterMissions()
  }, [missions, searchTerm, categoryFilter, difficultyFilter])

  const fetchMissions = async () => {
    const { data } = await supabase.from("missions").select("*").order("category", { ascending: true })

    if (data) {
      setMissions(data)
    }
  }

  const fetchUserMissions = async (userId: string) => {
    const { data } = await supabase
      .from("user_missions")
      .select(`
        *,
        missions (*)
      `)
      .eq("user_id", userId)
      .order("started_at", { ascending: false })

    if (data) {
      setUserMissions(data)
    }
  }

  const filterMissions = () => {
    let filtered = missions

    if (searchTerm) {
      filtered = filtered.filter(
        (mission) =>
          mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mission.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((mission) => mission.category === categoryFilter)
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter((mission) => mission.difficulty === difficultyFilter)
    }

    setFilteredMissions(filtered)
  }

  const startMission = async (missionId: string) => {
    if (!user) return

    const { error } = await supabase.from("user_missions").insert({
      user_id: user.id,
      mission_id: missionId,
      status: "active",
      progress: 0,
    })

    if (!error) {
      await fetchUserMissions(user.id)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "energy":
        return <Zap className="w-5 h-5" />
      case "transport":
        return <Car className="w-5 h-5" />
      case "waste":
        return <Trash2 className="w-5 h-5" />
      case "water":
        return <Droplets className="w-5 h-5" />
      case "food":
        return <Utensils className="w-5 h-5" />
      default:
        return <Target className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "energy":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "transport":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "waste":
        return "bg-green-100 text-green-800 border-green-200"
      case "water":
        return "bg-cyan-100 text-cyan-800 border-cyan-200"
      case "food":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "active":
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <Target className="w-5 h-5 text-gray-600" />
    }
  }

  const isUserMissionActive = (missionId: string) => {
    return userMissions.some((um) => um.mission_id === missionId && um.status === "active")
  }

  const getUserMissionStatus = (missionId: string) => {
    const userMission = userMissions.find((um) => um.mission_id === missionId)
    return userMission?.status || null
  }

  const groupedMissions = filteredMissions.reduce(
    (acc, mission) => {
      if (!acc[mission.category]) {
        acc[mission.category] = []
      }
      acc[mission.category].push(mission)
      return acc
    },
    {} as Record<string, Mission[]>,
  )

  const activeMissions = userMissions.filter((um) => um.status === "active")
  const completedMissions = userMissions.filter((um) => um.status === "completed")
  const totalPoints = completedMissions.reduce((sum, um) => sum + (um.missions?.points || 0), 0)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Climate Missions</h1>
          <p className="text-gray-600">Take action for the planet and earn points for your impact</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                  <p className="text-sm text-gray-600">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{activeMissions.length}</p>
                  <p className="text-sm text-gray-600">Active Missions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedMissions.length}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(completedMissions.length / 5) || 0}</p>
                  <p className="text-sm text-gray-600">Achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="browse">Browse Missions</TabsTrigger>
            <TabsTrigger value="active">My Active Missions</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* Browse Missions Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search missions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="energy">Energy</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="waste">Waste</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Mission Categories */}
            {Object.entries(groupedMissions).map(([category, categoryMissions]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>{getCategoryIcon(category)}</div>
                  <h2 className="text-xl font-semibold text-gray-900 capitalize">{category} Missions</h2>
                  <Badge variant="secondary">{categoryMissions.length}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {categoryMissions.map((mission) => {
                    const userStatus = getUserMissionStatus(mission.id)
                    const isActive = isUserMissionActive(mission.id)

                    return (
                      <Card key={mission.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg text-gray-900 mb-2">{mission.title}</CardTitle>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getCategoryColor(mission.category)} variant="outline">
                                  {mission.category}
                                </Badge>
                                <Badge className={getDifficultyColor(mission.difficulty)} variant="outline">
                                  {mission.difficulty}
                                </Badge>
                              </div>
                            </div>
                            {userStatus && getStatusIcon(userStatus)}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{mission.description}</p>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Trophy className="w-4 h-4" />
                                {mission.points} pts
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {mission.duration_days}d
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!userStatus && (
                              <Button
                                onClick={() => startMission(mission.id)}
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                size="sm"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Start Mission
                              </Button>
                            )}
                            {isActive && (
                              <Button
                                asChild
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                size="sm"
                              >
                                <Link href={`/missions/${mission.id}`}>
                                  <Target className="w-4 h-4 mr-1" />
                                  Continue
                                </Link>
                              </Button>
                            )}
                            {userStatus === "completed" && (
                              <Button
                                asChild
                                variant="outline"
                                className="flex-1 border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                                size="sm"
                              >
                                <Link href={`/missions/${mission.id}`}>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Active Missions Tab */}
          <TabsContent value="active" className="space-y-6">
            {activeMissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeMissions.map((userMission) => (
                  <Card key={userMission.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-gray-900">{userMission.missions.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getCategoryColor(userMission.missions.category)} variant="outline">
                              {userMission.missions.category}
                            </Badge>
                            <Badge className={getDifficultyColor(userMission.missions.difficulty)} variant="outline">
                              {userMission.missions.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{userMission.missions.description}</p>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{userMission.progress}%</span>
                          </div>
                          <Progress value={userMission.progress} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Started: {new Date(userMission.started_at).toLocaleDateString()}</span>
                          <span>{userMission.missions.points} points</span>
                        </div>
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                        >
                          <Link href={`/missions/${userMission.missions.id}`}>Continue Mission</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Missions</h3>
                  <p className="text-gray-600 mb-6">Start a mission to begin your climate action journey!</p>
                  <Button
                    onClick={() => setActiveTab("browse")}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    Browse Missions
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Completed Missions Tab */}
          <TabsContent value="completed" className="space-y-6">
            {completedMissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedMissions.map((userMission) => (
                  <Card key={userMission.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-gray-900">{userMission.missions.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getCategoryColor(userMission.missions.category)} variant="outline">
                              {userMission.missions.category}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800">+{userMission.missions.points} pts</Badge>
                          </div>
                        </div>
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{userMission.missions.description}</p>
                      <div className="text-sm text-gray-500">
                        <p>Completed: {new Date(userMission.completed_at!).toLocaleDateString()}</p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full mt-4 border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                      >
                        <Link href={`/missions/${userMission.missions.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Completed Missions Yet</h3>
                  <p className="text-gray-600 mb-6">Complete missions to earn points and make an impact!</p>
                  <Button
                    onClick={() => setActiveTab("browse")}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    Start Your First Mission
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

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
