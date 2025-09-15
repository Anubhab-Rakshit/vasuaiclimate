"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Thermometer, Droplets , MapPin , Globe , Info } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Sparkles, Target, TrendingUp, Wind, Users, Leaf, BarChart3, Activity, Zap, Trophy } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { GAIAWidget } from "@/components/gaia-widget"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  id: string
  full_name: string
  level: number
  total_points: number
  carbon_footprint_current: number
  missions_completed: number
  missions_active: number
  community_impact: number
}

interface EnvironmentalData {
  carbon_footprint: number
  energy_usage: number
  water_consumption: number
  transportation_impact: number
  created_at: string
}

interface WeatherData {
  aqi: number
  pm25: number
  pm10: number
  quality: string
}

// Mock data for charts (will be replaced with real data when available)
const carbonFootprintData = [
  { month: "Jan", personal: 2.8, average: 3.2, target: 2.5 },
  { month: "Feb", personal: 2.6, average: 3.1, target: 2.4 },
  { month: "Mar", personal: 2.4, average: 3.0, target: 2.3 },
  { month: "Apr", personal: 2.2, average: 2.9, target: 2.2 },
  { month: "May", personal: 2.1, average: 2.8, target: 2.1 },
  { month: "Jun", personal: 2.0, average: 2.7, target: 2.0 },
]

const airQualityData = [
  { time: "00:00", aqi: 45, pm25: 12, pm10: 18 },
  { time: "04:00", aqi: 38, pm25: 10, pm10: 15 },
  { time: "08:00", aqi: 52, pm25: 15, pm10: 22 },
  { time: "12:00", aqi: 48, pm25: 13, pm10: 20 },
  { time: "16:00", aqi: 42, pm25: 11, pm10: 17 },
  { time: "20:00", aqi: 40, pm25: 10, pm10: 16 },
]

const energyUsageData = [
  { category: "Heating", usage: 35, color: "#ff7043" },
  { category: "Lighting", usage: 20, color: "#4caf50" },
  { category: "Appliances", usage: 25, color: "#003f5c" },
  { category: "Cooling", usage: 15, color: "#87ceeb" },
  { category: "Other", usage: 5, color: "#e0f7fa" },
]

const weeklyImpactData = [
  { day: "Mon", transport: 1.2, energy: 2.1, waste: 0.3, water: 0.8 },
  { day: "Tue", transport: 0.8, energy: 1.9, waste: 0.2, water: 0.7 },
  { day: "Wed", transport: 1.5, energy: 2.3, waste: 0.4, water: 0.9 },
  { day: "Thu", transport: 0.9, energy: 1.8, waste: 0.2, water: 0.6 },
  { day: "Fri", transport: 1.1, energy: 2.0, waste: 0.3, water: 0.8 },
  { day: "Sat", transport: 0.5, energy: 1.6, waste: 0.1, water: 0.5 },
  { day: "Sun", transport: 0.3, energy: 1.4, waste: 0.1, water: 0.4 },
]

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Fetch user profile
          const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

          if (profile) {
            setUserProfile(profile)
          }

          // Fetch latest environmental data
          const { data: envData } = await supabase
            .from("environmental_data")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (envData) {
            setEnvironmentalData(envData)
          }

          // Fetch weather data
          try {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by this browser")
    }

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          console.error("Geolocation error:", error)
          reject(error)
          // Fallback to a default location (e.g., London)
          resolve({
          coords: { latitude: 51.5074, longitude: -0.1278 },
          timestamp: Date.now()
           } as GeolocationPosition)
        },
        {
          timeout: 10000,
          maximumAge: 600000,
          enableHighAccuracy: true,
        }
      )
    })

    const { latitude, longitude } = position.coords
    const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)
    
    if (response.ok) {
      const weather = await response.json()
      setWeatherData(weather)
      console.log("Fetched weather data:", weather)
    } else {
      throw new Error("Weather API request failed")
    }
  } catch (error) {
    console.error("Failed to fetch weather data:", error)
    setWeatherData(null)
    // Optionally set default weather data or show error message
  }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setUserProfile(null)
        setEnvironmentalData(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

// Correct way to access the weather data
const carbonFootprint = environmentalData?.carbon_footprint || 2.1
const airQuality = weatherData?.airQuality?.aqi ? getAirQualityText(weatherData.airQuality.aqi) : "Good"
const aqi = weatherData?.airQuality?.aqi || 42
const activeMissions = userProfile?.missions_active || 0
const completedMissions = userProfile?.missions_completed || 0
const totalMissions = activeMissions + completedMissions || 5
const communityImpact = userProfile?.community_impact || 1200
const userLevel = userProfile?.level || (user ? 1 : 12)
const totalPoints = userProfile?.total_points || 0

// Helper function to convert AQI number to text
function getAirQualityText(aqi: number): string {
  switch (aqi) {
    case 1: return "Excellent"
    case 2: return "Good"
    case 3: return "Fair"
    case 4: return "Poor"
    case 5: return "Very Poor"
    default: return "Good"
  }
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-bold text-balance mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Learn. Act. Impact.
            </h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto mb-8">
              Join millions in the fight against climate change with personalized AI tutoring, real-time environmental
              data, and gamified learning missions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Chat with GAIA
                </Button>
              </Link>
              <Link href="/missions">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Start Mission
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Key Metrics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
  {/* Temperature Card */}
  <Card className="backdrop-blur-sm bg-card/80 border-border/50 hover:shadow-lg transition-all duration-300">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Thermometer className="h-4 w-4 text-red-500" />
        Temperature
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary mb-2">
        {weatherData?.weather?.temperature || 25}°C
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {weatherData?.weather?.description || "Clear sky"}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Feels like {Math.round((weatherData?.weather?.temperature || 25) * 1.1)}°C
        </span>
      </div>
    </CardContent>
  </Card>

  {/* Air Quality Card */}
  {/* Comprehensive Air Quality Card */}
<Card className="backdrop-blur-sm bg-card/80 border-border/50 hover:shadow-lg transition-all duration-300">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
      <Wind className="h-4 w-4 text-blue-500" />
      Air Quality Details
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* AQI Summary */}
    <div className="mb-4 p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Overall AQI</span>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          (weatherData?.airQuality?.aqi || 2) === 1 ? "bg-green-100 text-green-800" :
          (weatherData?.airQuality?.aqi || 2) === 2 ? "bg-blue-100 text-blue-800" :
          (weatherData?.airQuality?.aqi || 2) === 3 ? "bg-yellow-100 text-yellow-800" :
          (weatherData?.airQuality?.aqi || 2) === 4 ? "bg-orange-100 text-orange-800" :
          "bg-red-100 text-red-800"
        }`}>
          {getAirQualityText(weatherData?.airQuality?.aqi || 2)}
        </div>
      </div>
      <div className="text-2xl font-bold text-primary">
        {weatherData?.airQuality?.aqi || 2}
      </div>
    </div>

    {/* Pollutant Details */}
    <div className="space-y-3">
      {/* PM2.5 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">PM2.5</span>
          <Info className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium">
          {weatherData?.airQuality?.pm25 || 0} μg/m³
        </div>
      </div>

      {/* PM10 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">PM10</span>
          <Info className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium">
          {weatherData?.airQuality?.pm10 || 0} μg/m³
        </div>
      </div>

      {/* NO2 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">NO₂</span>
          <Info className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium">
          {weatherData?.airQuality?.no2 || 0} μg/m³
        </div>
      </div>

      {/* O3 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">O₃</span>
          <Info className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium">
          {weatherData?.airQuality?.o3 || 0} μg/m³
        </div>
      </div>

      {/* CO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">CO</span>
          <Info className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium">
          {weatherData?.airQuality?.co || 0} μg/m³
        </div>
      </div>
    </div>

  </CardContent>
</Card>

  {/* Humidity Card */}
  <Card className="backdrop-blur-sm bg-card/80 border-border/50 hover:shadow-lg transition-all duration-300">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Droplets className="h-4 w-4 text-blue-400" />
        Humidity
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary mb-2">
        {weatherData?.weather?.humidity || 50}%
      </div>
      <p className="text-sm text-muted-foreground mb-3">Relative humidity</p>
      <Progress 
        value={weatherData?.weather?.humidity || 50} 
        className="h-2" 
      />
      <p className="text-xs text-secondary mt-2">
        {weatherData?.weather?.humidity > 70 
          ? "High humidity" 
          : weatherData?.weather?.humidity > 40 
          ? "Comfortable" 
          : "Low humidity"
        }
      </p>
    </CardContent>
  </Card>

  {/* Wind Speed Card */}
  <Card className="backdrop-blur-sm bg-card/80 border-border/50 hover:shadow-lg transition-all duration-300">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Wind className="h-4 w-4 text-green-500" />
        Wind Speed
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary mb-2">
        {weatherData?.weather?.windSpeed || 10} km/h
      </div>
  
    </CardContent>
  </Card>
  {/* Location Card */}
<Card className="backdrop-blur-sm bg-card/80 border-border/50 hover:shadow-lg transition-all duration-300">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
      <MapPin className="h-4 w-4 text-blue-500" />
      Location
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-xl font-bold text-primary mb-2">
      {weatherData?.weather?.location || "Unknown Location"}
    </div>
    <p className="text-sm text-muted-foreground mb-3">
      {weatherData?.weather?.country || "Unknown Country"}
    </p>
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Globe className="h-3 w-3" />
     
    </div>
    <div className="mt-3 p-2 bg-muted/50 rounded-lg">
      <p className="text-xs text-muted-foreground">
        Last updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  </CardContent>
</Card>


          <Card className="backdrop-blur-sm bg-card/80 border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Active Missions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent mb-2">
                {completedMissions}/{totalMissions}
              </div>
              <p className="text-sm text-muted-foreground mb-3">Completed this week</p>
              <Progress value={(completedMissions / totalMissions) * 100} className="h-2" />
              <p className="text-xs text-primary mt-2">{activeMissions} missions remaining</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-card/80 border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-secondary" />
                Community Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary mb-2">{(communityImpact / 1000).toFixed(1)}k</div>
              <p className="text-sm text-muted-foreground mb-3">CO₂ saved together</p>
              <div className="flex items-center gap-2">
                <Leaf className="h-3 w-3 text-secondary" />
                <span className="text-xs text-muted-foreground">
                  Equivalent to {Math.round(communityImpact / 24)} trees
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Visualization Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Carbon Footprint Trend */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Carbon Footprint Trend
              </CardTitle>
              <CardDescription>Your monthly progress vs. targets and averages</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  personal: { label: "Your Footprint", color: "hsl(var(--chart-1))" },
                  average: { label: "Global Average", color: "hsl(var(--chart-2))" },
                  target: { label: "Target", color: "hsl(var(--chart-3))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={carbonFootprintData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="personal" stroke="var(--color-personal)" strokeWidth={3} />
                    <Line type="monotone" dataKey="average" stroke="var(--color-average)" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="target" stroke="var(--color-target)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Air Quality Monitor */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                Real-time Air Quality
              </CardTitle>
              <CardDescription>24-hour air quality monitoring in your area</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  aqi: { label: "AQI", color: "hsl(var(--chart-1))" },
                  pm25: { label: "PM2.5", color: "hsl(var(--chart-2))" },
                  pm10: { label: "PM10", color: "hsl(var(--chart-3))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={airQualityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="aqi"
                      stackId="1"
                      stroke="var(--color-aqi)"
                      fill="var(--color-aqi)"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="pm25"
                      stackId="2"
                      stroke="var(--color-pm25)"
                      fill="var(--color-pm25)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Energy Usage Breakdown */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                Energy Usage Breakdown
              </CardTitle>
              <CardDescription>Your home energy consumption by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  usage: { label: "Usage (%)", color: "hsl(var(--chart-1))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={energyUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, usage }) => `${category}: ${usage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage"
                    >
                      {energyUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Weekly Impact Analysis */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Weekly Impact Analysis
              </CardTitle>
              <CardDescription>Daily breakdown of your environmental impact</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  transport: { label: "Transport", color: "hsl(var(--chart-1))" },
                  energy: { label: "Energy", color: "hsl(var(--chart-2))" },
                  waste: { label: "Waste", color: "hsl(var(--chart-3))" },
                  water: { label: "Water", color: "hsl(var(--chart-4))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyImpactData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="transport" stackId="a" fill="var(--color-transport)" />
                    <Bar dataKey="energy" stackId="a" fill="var(--color-energy)" />
                    <Bar dataKey="waste" stackId="a" fill="var(--color-waste)" />
                    <Bar dataKey="water" stackId="a" fill="var(--color-water)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions for Authenticated Users */}
        {user && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Quick Actions</h3>
                <p className="text-muted-foreground">Continue your climate journey</p>
              </div>
              {totalPoints > 0 && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  <span className="text-lg font-semibold text-foreground">{totalPoints.toLocaleString()} pts</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/missions">
                <Card className="backdrop-blur-sm bg-card/80 border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-semibold">Start New Mission</h4>
                        <p className="text-sm text-muted-foreground">Earn points and make impact</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/environmental-data">
                <Card className="backdrop-blur-sm bg-card/80 border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <BarChart3 className="h-8 w-8 text-secondary" />
                      <div>
                        <h4 className="font-semibold">Track Your Data</h4>
                        <p className="text-sm text-muted-foreground">Monitor environmental impact</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/community">
                <Card className="backdrop-blur-sm bg-card/80 border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-8 w-8 text-accent" />
                      <div>
                        <h4 className="font-semibold">Join Community</h4>
                        <p className="text-sm text-muted-foreground">Connect with others</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* GAIA Widget - only show for authenticated users */}
      {user && <GAIAWidget />}
    </div>
  )
}
