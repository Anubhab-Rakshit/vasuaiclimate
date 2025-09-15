"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Target, Trophy, Clock, Camera, CheckCircle, Upload, ArrowLeft, Star, Share2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"

interface Mission {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  points: number
  duration_days: number
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

export default function MissionDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [mission, setMission] = useState<Mission | null>(null)
  const [userMission, setUserMission] = useState<UserMission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [completionNotes, setCompletionNotes] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const missionId = params.id as string

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
      await fetchMissionData(user.id)
      setIsLoading(false)
    }
    getUser()
  }, [missionId, router, supabase.auth])

  const fetchMissionData = async (userId: string) => {
    // Fetch mission details
    const { data: missionData } = await supabase.from("missions").select("*").eq("id", missionId).single()

    if (missionData) {
      setMission(missionData)
    }

    // Fetch user mission progress
    const { data: userMissionData } = await supabase
      .from("user_missions")
      .select(`
        *,
        missions (*)
      `)
      .eq("user_id", userId)
      .eq("mission_id", missionId)
      .single()

    if (userMissionData) {
      setUserMission(userMissionData)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const uploadPhoto = async () => {
    if (!selectedFile || !userMission) return null

    setUploadingPhoto(true)
    try {
      // In a real implementation, you would upload to Vercel Blob
      // For demo purposes, we'll simulate the upload
      const mockPhotoUrl = `https://example.com/photos/${Date.now()}.jpg`

      // Update user mission with photo URL
      const { error } = await supabase
        .from("user_missions")
        .update({ photo_url: mockPhotoUrl })
        .eq("id", userMission.id)

      if (!error) {
        await fetchMissionData(user.id)
        return mockPhotoUrl
      }
    } catch (error) {
      console.error("Photo upload failed:", error)
    } finally {
      setUploadingPhoto(false)
    }
    return null
  }

  const completeMission = async () => {
    if (!userMission) return

    let photoUrl = userMission.photo_url

    // Upload photo if selected
    if (selectedFile) {
      photoUrl = await uploadPhoto()
    }

    // Mark mission as completed
    const { error } = await supabase
      .from("user_missions")
      .update({
        status: "completed",
        progress: 100,
        completed_at: new Date().toISOString(),
        photo_url: photoUrl,
      })
      .eq("id", userMission.id)

    if (!error) {
      // Update user points
      const { data: profile } = await supabase.from("profiles").select("total_points").eq("id", user.id).single()

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            total_points: (profile.total_points || 0) + (mission?.points || 0),
          })
          .eq("id", user.id)
      }

      await fetchMissionData(user.id)
    }
  }

  const updateProgress = async (newProgress: number) => {
    if (!userMission) return

    const { error } = await supabase.from("user_missions").update({ progress: newProgress }).eq("id", userMission.id)

    if (!error) {
      await fetchMissionData(user.id)
    }
  }

  const startMission = async () => {
    if (!mission || !user) return

    const { error } = await supabase.from("user_missions").insert({
      user_id: user.id,
      mission_id: mission.id,
      status: "active",
      progress: 0,
    })

    if (!error) {
      await fetchMissionData(user.id)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Mission Not Found</h2>
            <p className="text-gray-600 mb-4">The mission you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/missions")} variant="outline">
              Back to Missions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/missions")}
            className="mb-4 text-emerald-700 hover:bg-emerald-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Missions
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{mission.title}</h1>
              <div className="flex items-center gap-3">
                <Badge className={getCategoryColor(mission.category)} variant="outline">
                  {mission.category}
                </Badge>
                <Badge className={getDifficultyColor(mission.difficulty)} variant="outline">
                  {mission.difficulty}
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                  <Trophy className="w-3 h-3 mr-1" />
                  {mission.points} points
                </Badge>
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                  <Clock className="w-3 h-3 mr-1" />
                  {mission.duration_days} days
                </Badge>
              </div>
            </div>
            {userMission?.status === "completed" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold">Completed!</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mission Description */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  Mission Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{mission.description}</p>
              </CardContent>
            </Card>

            {/* Progress Section */}
            {userMission && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-emerald-600" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{userMission.progress}%</span>
                    </div>
                    <Progress value={userMission.progress} className="h-3" />
                  </div>

                  {userMission.status === "active" && (
                    <div className="space-y-3">
                      <Label>Update Progress</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProgress(25)}
                          disabled={userMission.progress >= 25}
                        >
                          25%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProgress(50)}
                          disabled={userMission.progress >= 50}
                        >
                          50%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProgress(75)}
                          disabled={userMission.progress >= 75}
                        >
                          75%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProgress(100)}
                          disabled={userMission.progress >= 100}
                        >
                          100%
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Started: {new Date(userMission.started_at).toLocaleDateString()}</span>
                    {userMission.completed_at && (
                      <span>Completed: {new Date(userMission.completed_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photo Upload Section */}
            {userMission && userMission.status === "active" && userMission.progress >= 75 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-600" />
                    Mission Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Upload a photo to verify your mission completion and earn your points!
                  </p>

                  <div className="space-y-3">
                    <Label htmlFor="photo">Upload Photo</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                  </div>

                  {previewUrl && (
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={previewUrl || "/placeholder.svg"}
                        alt="Mission verification"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Completion Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Share your experience or any challenges you faced..."
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={completeMission}
                    disabled={uploadingPhoto}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    {uploadingPhoto ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Completing Mission...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Mission
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Completed Mission Photo */}
            {userMission?.photo_url && userMission.status === "completed" && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-600" />
                    Mission Verification Photo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={userMission.photo_url || "/placeholder.svg"}
                      alt="Mission completion"
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                {!userMission && (
                  <Button
                    onClick={startMission}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Start Mission
                  </Button>
                )}

                {userMission?.status === "active" && (
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Mission Status</p>
                      <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Progress
                    </Button>
                  </div>
                )}

                {userMission?.status === "completed" && (
                  <div className="space-y-3 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-900">Mission Completed!</p>
                      <p className="text-sm text-green-700">+{mission.points} points earned</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Achievement
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mission Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Mission Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reward Points</span>
                  <span className="font-semibold">{mission.points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="font-semibold">{mission.duration_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Difficulty</span>
                  <Badge className={getDifficultyColor(mission.difficulty)} variant="outline">
                    {mission.difficulty}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <Badge className={getCategoryColor(mission.category)} variant="outline">
                    {mission.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Take photos to document your progress</li>
                  <li>• Share your journey with friends</li>
                  <li>• Ask GAIA for personalized advice</li>
                  <li>• Track your environmental impact</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
