"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
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
import {
  Thermometer,
  Wind,
  Droplets,
  Car,
  Zap,
  Leaf,
  TrendingUp,
  Plus,
  MapPin,
  AlertCircle,
  Target,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface WeatherData {
  weather: {
    temperature: number
    humidity: number
    windSpeed: number
    description: string
  }
  airQuality: {
    aqi: number
    pm25: number
    pm10: number
    no2: number
    o3: number
  }
}

interface EnvironmentalData {
  id: string
  data_type: string
  value: number
  unit: string
  recorded_at: string
}

export default function EnvironmentalDataPage() {
  const [user, setUser] = useState<any>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Form states
  const [newDataType, setNewDataType] = useState("")
  const [newValue, setNewValue] = useState("")
  const [newUnit, setNewUnit] = useState("")

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
      await fetchEnvironmentalData(user.id)
      await fetchWeatherData()
      setIsLoading(false)
    }
    getUser()
  }, [router, supabase.auth])

  const fetchEnvironmentalData = async (userId: string) => {
    const { data } = await supabase
      .from("environmental_data")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(50)

    if (data) {
      setEnvironmentalData(data)
    }
  }

  const fetchWeatherData = async () => {
    // Get user's location (mock coordinates for demo)
    const lat = 40.7128
    const lon = -74.006

    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      const data = await response.json()
      setWeatherData(data)
    } catch (error) {
      console.error("Failed to fetch weather data:", error)
    }
  }

  const addEnvironmentalData = async () => {
    if (!user || !newDataType || !newValue || !newUnit) return

    const { error } = await supabase.from("environmental_data").insert({
      user_id: user.id,
      data_type: newDataType,
      value: Number.parseFloat(newValue),
      unit: newUnit,
    })

    if (!error) {
      await fetchEnvironmentalData(user.id)
      setNewDataType("")
      setNewValue("")
      setNewUnit("")
    }
  }

  const calculateCarbonFootprint = () => {
    const energyData = environmentalData.filter((d) => d.data_type === "energy_usage")
    const transportData = environmentalData.filter((d) => d.data_type === "transport_emissions")

    const totalEnergy = energyData.reduce((sum, d) => sum + d.value, 0)
    const totalTransport = transportData.reduce((sum, d) => sum + d.value, 0)

    // Simple carbon footprint calculation (kg CO2)
    const energyFootprint = totalEnergy * 0.5 // 0.5 kg CO2 per kWh
    const transportFootprint = totalTransport * 2.3 // 2.3 kg CO2 per liter of fuel

    return energyFootprint + transportFootprint
  }

  const getAQIColor = (aqi: number) => {
    if (aqi <= 1) return "text-green-600 bg-green-100"
    if (aqi <= 2) return "text-yellow-600 bg-yellow-100"
    if (aqi <= 3) return "text-orange-600 bg-orange-100"
    if (aqi <= 4) return "text-red-600 bg-red-100"
    return "text-purple-600 bg-purple-100"
  }

  const getAQILabel = (aqi: number) => {
    if (aqi <= 1) return "Good"
    if (aqi <= 2) return "Fair"
    if (aqi <= 3) return "Moderate"
    if (aqi <= 4) return "Poor"
    return "Very Poor"
  }

  // Prepare chart data
  const chartData = environmentalData
    .slice(0, 10)
    .reverse()
    .map((d) => ({
      date: new Date(d.recorded_at).toLocaleDateString(),
      value: d.value,
      type: d.data_type,
    }))

  const categoryData = environmentalData.reduce(
    (acc, d) => {
      const category = d.data_type.replace("_", " ")
      acc[category] = (acc[category] || 0) + d.value
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }))

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Environmental Dashboard</h1>
          <p className="text-gray-600">Track your environmental impact and local conditions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="weather">Weather & Air</TabsTrigger>
            <TabsTrigger value="tracking">Data Tracking</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{calculateCarbonFootprint().toFixed(1)}</p>
                      <p className="text-sm text-gray-600">kg CO₂ This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {environmentalData
                          .filter((d) => d.data_type === "energy_usage")
                          .reduce((sum, d) => sum + d.value, 0)
                          .toFixed(0)}
                      </p>
                      <p className="text-sm text-gray-600">kWh Energy Used</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Droplets className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {environmentalData
                          .filter((d) => d.data_type === "water_usage")
                          .reduce((sum, d) => sum + d.value, 0)
                          .toFixed(0)}
                      </p>
                      <p className="text-sm text-gray-600">Liters Water Used</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Car className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {environmentalData
                          .filter((d) => d.data_type === "transport_emissions")
                          .reduce((sum, d) => sum + d.value, 0)
                          .toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600">km Traveled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Environmental Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    Impact by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
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

          {/* Weather & Air Quality Tab */}
          <TabsContent value="weather" className="space-y-6">
            {weatherData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="w-5 h-5 text-emerald-600" />
                      Current Weather
                      <MapPin className="w-4 h-4 text-gray-500 ml-auto" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-gray-900">{weatherData.weather.temperature}°C</p>
                      <p className="text-gray-600 capitalize">{weatherData.weather.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Humidity: {weatherData.weather.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Wind: {weatherData.weather.windSpeed} km/h</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-emerald-600" />
                      Air Quality Index
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <Badge className={`text-lg px-4 py-2 ${getAQIColor(weatherData.airQuality.aqi)}`}>
                        {getAQILabel(weatherData.airQuality.aqi)} (AQI: {weatherData.airQuality.aqi})
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">PM2.5</span>
                        <span className="text-sm font-medium">{weatherData.airQuality.pm25} μg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">PM10</span>
                        <span className="text-sm font-medium">{weatherData.airQuality.pm10} μg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">NO₂</span>
                        <span className="text-sm font-medium">{weatherData.airQuality.no2} μg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">O₃</span>
                        <span className="text-sm font-medium">{weatherData.airQuality.o3} μg/m³</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Data Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add New Data */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-600" />
                    Add Environmental Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataType">Data Type</Label>
                    <Select value={newDataType} onValueChange={setNewDataType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="energy_usage">Energy Usage</SelectItem>
                        <SelectItem value="water_usage">Water Usage</SelectItem>
                        <SelectItem value="transport_emissions">Transport</SelectItem>
                        <SelectItem value="carbon_footprint">Carbon Footprint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder="Enter value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={newUnit} onValueChange={setNewUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kWh">kWh</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="km">Kilometers</SelectItem>
                        <SelectItem value="kg CO2">kg CO₂</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={addEnvironmentalData}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    Add Data
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Data */}
              <div className="lg:col-span-2">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Recent Environmental Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {environmentalData.slice(0, 10).map((data) => (
                        <div key={data.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{data.data_type.replace("_", " ")}</p>
                            <p className="text-sm text-gray-500">{new Date(data.recorded_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {data.value} {data.unit}
                            </p>
                          </div>
                        </div>
                      ))}
                      {environmentalData.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No data recorded yet. Start tracking!</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  Carbon Footprint Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Energy Usage</h3>
                    <div className="space-y-2">
                      <Label>Monthly electricity (kWh)</Label>
                      <Input type="number" placeholder="300" />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly gas (m³)</Label>
                      <Input type="number" placeholder="50" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Transportation</h3>
                    <div className="space-y-2">
                      <Label>Car distance (km/month)</Label>
                      <Input type="number" placeholder="1000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Flights (hours/year)</Label>
                      <Input type="number" placeholder="10" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Lifestyle</h3>
                    <div className="space-y-2">
                      <Label>Meat meals per week</Label>
                      <Input type="number" placeholder="7" />
                    </div>
                    <div className="space-y-2">
                      <Label>Waste (kg/week)</Label>
                      <Input type="number" placeholder="10" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-emerald-900">Estimated Annual Footprint</p>
                      <p className="text-sm text-emerald-700">Based on your inputs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-emerald-900">{calculateCarbonFootprint().toFixed(1)}</p>
                      <p className="text-sm text-emerald-700">tonnes CO₂/year</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-emerald-700 mb-1">
                      <span>Global Average: 4.8 tonnes</span>
                      <span>Target: 2.3 tonnes</span>
                    </div>
                    <Progress value={Math.min((calculateCarbonFootprint() / 4.8) * 100, 100)} className="h-2" />
                  </div>
                </div>

                <Button className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                  Save Calculation & Get Recommendations
                </Button>
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
