"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Calendar,
  MapPin,
  Trophy,
  Target,
  Camera,
  Send,
  Globe,
  UserPlus,
  Award,
  Clock,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface CommunityPost {
  id: string
  user_id: string
  title: string
  content: string
  image_url: string | null
  likes_count: number
  created_at: string
  profiles: {
    full_name: string
    username: string
    avatar_url: string | null
    level: number
  }
}

interface Challenge {
  id: string
  title: string
  description: string
  participants: number
  end_date: string
  reward_points: number
  category: string
}

interface LocalGroup {
  id: string
  name: string
  description: string
  location: string
  members: number
  category: string
  next_event: string
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  organizer: string
  attendees: number
  category: string
}

export default function CommunityPage() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [localGroups, setLocalGroups] = useState<LocalGroup[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("feed")
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [isCreatingPost, setIsCreatingPost] = useState(false)

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
      await fetchCommunityData()
      setIsLoading(false)
    }
    getUser()
  }, [router, supabase.auth])

  const fetchCommunityData = async () => {
    // Fetch community posts
    const { data: postsData } = await supabase
      .from("community_posts")
      .select(`
        *,
        profiles (full_name, username, avatar_url, level)
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    if (postsData) {
      setPosts(postsData)
    }

    // Mock data for challenges, groups, and events
    setChallenges([
      {
        id: "1",
        title: "30-Day Zero Waste Challenge",
        description: "Reduce your waste to zero for 30 consecutive days",
        participants: 1247,
        end_date: "2024-02-29",
        reward_points: 500,
        category: "waste",
      },
      {
        id: "2",
        title: "Plant 1000 Trees Together",
        description: "Community tree planting initiative across the globe",
        participants: 892,
        end_date: "2024-03-15",
        reward_points: 300,
        category: "environment",
      },
      {
        id: "3",
        title: "Bike to Work Week",
        description: "Commit to biking to work for an entire week",
        participants: 634,
        end_date: "2024-02-10",
        reward_points: 200,
        category: "transport",
      },
    ])

    setLocalGroups([
      {
        id: "1",
        name: "Green NYC Collective",
        description: "Environmental activists making NYC more sustainable",
        location: "New York, NY",
        members: 342,
        category: "activism",
        next_event: "2024-02-15",
      },
      {
        id: "2",
        name: "Solar Power Enthusiasts",
        description: "Promoting renewable energy adoption in communities",
        location: "San Francisco, CA",
        members: 189,
        category: "energy",
        next_event: "2024-02-20",
      },
      {
        id: "3",
        name: "Urban Gardeners United",
        description: "Growing food sustainably in urban environments",
        location: "Chicago, IL",
        members: 267,
        category: "food",
        next_event: "2024-02-18",
      },
    ])

    setEvents([
      {
        id: "1",
        title: "Community Solar Workshop",
        description: "Learn about installing solar panels in your home",
        date: "2024-02-15",
        location: "Community Center, Downtown",
        organizer: "Green Energy Alliance",
        attendees: 45,
        category: "education",
      },
      {
        id: "2",
        title: "Beach Cleanup Drive",
        description: "Join us for a morning of beach cleaning and conservation",
        date: "2024-02-17",
        location: "Sunset Beach",
        organizer: "Ocean Guardians",
        attendees: 78,
        category: "cleanup",
      },
      {
        id: "3",
        title: "Sustainable Living Fair",
        description: "Discover eco-friendly products and sustainable practices",
        date: "2024-02-22",
        location: "City Park Pavilion",
        organizer: "EcoLife Community",
        attendees: 156,
        category: "fair",
      },
    ])
  }

  const createPost = async () => {
    if (!user || !newPostTitle.trim() || !newPostContent.trim()) return

    setIsCreatingPost(true)
    try {
      const { error } = await supabase.from("community_posts").insert({
        user_id: user.id,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        likes_count: 0,
      })

      if (!error) {
        setNewPostTitle("")
        setNewPostContent("")
        await fetchCommunityData()
      }
    } catch (error) {
      console.error("Failed to create post:", error)
    } finally {
      setIsCreatingPost(false)
    }
  }

  const likePost = async (postId: string) => {
    // In a real implementation, you would track user likes and update accordingly
    const updatedPosts = posts.map((post) =>
      post.id === postId ? { ...post, likes_count: post.likes_count + 1 } : post,
    )
    setPosts(updatedPosts)
  }

  const joinChallenge = async (challengeId: string) => {
    // In a real implementation, you would add user to challenge participants
    const updatedChallenges = challenges.map((challenge) =>
      challenge.id === challengeId ? { ...challenge, participants: challenge.participants + 1 } : challenge,
    )
    setChallenges(updatedChallenges)
  }

  const joinGroup = async (groupId: string) => {
    // In a real implementation, you would add user to group members
    const updatedGroups = localGroups.map((group) =>
      group.id === groupId ? { ...group, members: group.members + 1 } : group,
    )
    setLocalGroups(updatedGroups)
  }

  const attendEvent = async (eventId: string) => {
    // In a real implementation, you would add user to event attendees
    const updatedEvents = events.map((event) =>
      event.id === eventId ? { ...event, attendees: event.attendees + 1 } : event,
    )
    setEvents(updatedEvents)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "waste":
        return "bg-green-100 text-green-800"
      case "energy":
        return "bg-yellow-100 text-yellow-800"
      case "transport":
        return "bg-blue-100 text-blue-800"
      case "environment":
        return "bg-emerald-100 text-emerald-800"
      case "food":
        return "bg-orange-100 text-orange-800"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
              <p className="text-gray-600">Connect with fellow climate champions and share your journey</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Share Story
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Your Climate Story</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="What's your story about?"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Share your experience, tips, or achievements..."
                      rows={4}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Add Photo (Optional)</Label>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                  <Button
                    onClick={createPost}
                    disabled={isCreatingPost || !newPostTitle.trim() || !newPostContent.trim()}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    {isCreatingPost ? (
                      <>
                        <Send className="w-4 h-4 mr-2 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Share Story
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="groups">Local Groups</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
          </TabsList>

          {/* Community Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <Card key={post.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.profiles?.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                              {post.profiles?.full_name?.[0] || post.profiles?.username?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {post.profiles?.full_name || post.profiles?.username}
                              </h3>
                              <Badge className="bg-emerald-100 text-emerald-800">
                                Level {post.profiles?.level || 1}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
                        <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                        {post.image_url && (
                          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <Image
                              src={post.image_url || "/placeholder.svg"}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likePost(post.id)}
                            className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            {post.likes_count}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Comment
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-green-600 hover:bg-green-50"
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Posts Yet</h3>
                      <p className="text-gray-600 mb-6">Be the first to share your climate action story!</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                            Share Your Story
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Share Your Climate Story</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                placeholder="What's your story about?"
                                value={newPostTitle}
                                onChange={(e) => setNewPostTitle(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="content">Content</Label>
                              <Textarea
                                id="content"
                                placeholder="Share your experience, tips, or achievements..."
                                rows={4}
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                              />
                            </div>
                            <Button
                              onClick={createPost}
                              disabled={isCreatingPost || !newPostTitle.trim() || !newPostContent.trim()}
                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                            >
                              {isCreatingPost ? "Sharing..." : "Share Story"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Community Stats */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-emerald-600" />
                      Community Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Members</span>
                      <span className="font-semibold">12,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Missions Completed</span>
                      <span className="font-semibold">45,392</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">CO₂ Saved</span>
                      <span className="font-semibold">2,847 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Trees Planted</span>
                      <span className="font-semibold">1,234</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Trending Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Badge variant="outline" className="mr-2 mb-2">
                      #ZeroWaste
                    </Badge>
                    <Badge variant="outline" className="mr-2 mb-2">
                      #SolarPower
                    </Badge>
                    <Badge variant="outline" className="mr-2 mb-2">
                      #BikeToWork
                    </Badge>
                    <Badge variant="outline" className="mr-2 mb-2">
                      #PlantBased
                    </Badge>
                    <Badge variant="outline" className="mr-2 mb-2">
                      #TreePlanting
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-gray-900 mb-2">{challenge.title}</CardTitle>
                        <Badge className={getCategoryColor(challenge.category)} variant="outline">
                          {challenge.category}
                        </Badge>
                      </div>
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Participants</span>
                        <span className="font-semibold">{challenge.participants.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Reward</span>
                        <span className="font-semibold text-emerald-600">{challenge.reward_points} points</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Ends</span>
                        <span className="font-semibold">{new Date(challenge.end_date).toLocaleDateString()}</span>
                      </div>
                      <Button
                        onClick={() => joinChallenge(challenge.id)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Join Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Local Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {localGroups.map((group) => (
                <Card key={group.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-gray-900 mb-2">{group.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          {group.location}
                        </div>
                        <Badge className={getCategoryColor(group.category)} variant="outline">
                          {group.category}
                        </Badge>
                      </div>
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Members</span>
                        <span className="font-semibold">{group.members}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Next Event</span>
                        <span className="font-semibold">{new Date(group.next_event).toLocaleDateString()}</span>
                      </div>
                      <Button
                        onClick={() => joinGroup(group.id)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Group
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-gray-900 mb-2">{event.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                        <Badge className={getCategoryColor(event.category)} variant="outline">
                          {event.category}
                        </Badge>
                      </div>
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Organizer</span>
                        <span className="font-semibold">{event.organizer}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Attendees</span>
                        <span className="font-semibold">{event.attendees}</span>
                      </div>
                      <Button
                        onClick={() => attendEvent(event.id)}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Attend Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Mentorship Tab */}
          <TabsContent value="mentorship" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Become a Mentor */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    Become a Mentor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Share your climate action expertise and help guide newcomers on their sustainability journey.
                  </p>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>Help others achieve their climate goals</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>Earn mentor badges and recognition</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>Build a network of climate champions</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    Apply to be a Mentor
                  </Button>
                </CardContent>
              </Card>

              {/* Find a Mentor */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    Find a Mentor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Connect with experienced climate activists who can guide you on your sustainability journey.
                  </p>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Get personalized advice and support</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Learn from experienced practitioners</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Accelerate your climate impact</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    Find a Mentor
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Featured Mentors */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Featured Mentors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: "Sarah Chen",
                      expertise: "Solar Energy & Home Efficiency",
                      level: 15,
                      mentees: 23,
                      rating: 4.9,
                    },
                    {
                      name: "Marcus Rodriguez",
                      expertise: "Sustainable Transportation",
                      level: 12,
                      mentees: 18,
                      rating: 4.8,
                    },
                    {
                      name: "Emma Thompson",
                      expertise: "Zero Waste Living",
                      level: 18,
                      mentees: 31,
                      rating: 5.0,
                    },
                  ].map((mentor, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                            {mentor.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                          <Badge className="bg-emerald-100 text-emerald-800">Level {mentor.level}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{mentor.expertise}</p>
                      <div className="flex justify-between text-xs text-gray-500 mb-3">
                        <span>{mentor.mentees} mentees</span>
                        <span>★ {mentor.rating}</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
