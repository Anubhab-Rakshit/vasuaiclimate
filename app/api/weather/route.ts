import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenWeatherMap API key not configured. Please add OPENWEATHERMAP_API_KEY to your environment variables.",
      },
      { status: 500 },
    )
  }

  try {
    // Fetch current weather data
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
    )

    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`)
    }

    const weatherData = await weatherResponse.json()

    // Fetch air pollution data
    const airPollutionResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`,
    )

    if (!airPollutionResponse.ok) {
      throw new Error(`Air pollution API error: ${airPollutionResponse.status}`)
    }

    const airPollutionData = await airPollutionResponse.json()

    // Transform the data to match our expected format
    const transformedData = {
      weather: {
        temperature: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind?.speed * 3.6 || 0), // Convert m/s to km/h
        description: weatherData.weather[0]?.description || "Unknown",
        location: weatherData.name,
        country: weatherData.sys.country,
      },
      airQuality: {
        aqi: airPollutionData.list[0]?.main.aqi || 1,
        pm25: Math.round(airPollutionData.list[0]?.components.pm2_5 || 0),
        pm10: Math.round(airPollutionData.list[0]?.components.pm10 || 0),
        no2: Math.round(airPollutionData.list[0]?.components.no2 || 0),
        o3: Math.round(airPollutionData.list[0]?.components.o3 || 0),
        co: Math.round(airPollutionData.list[0]?.components.co || 0),
      },
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch weather data. Please try again later.",
      },
      { status: 500 },
    )
  }
}
