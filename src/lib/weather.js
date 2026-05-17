function getFieldworkAdvice(condition, temp) {
  const text = (condition || '').toLowerCase()
  if (temp > 35) return 'Too hot — limit outdoor work'
  if (temp < 5) return 'Too cold — avoid fieldwork'
  if (text.includes('thunder') || text.includes('heavy rain')) return 'Avoid fieldwork — severe weather expected'
  if (text.includes('rain') || text.includes('drizzle') || text.includes('shower')) return 'Avoid fieldwork — precipitation expected'
  if (text.includes('fog') || text.includes('mist')) return 'Poor visibility — delay fieldwork'
  if (text.includes('sunny') || text.includes('clear')) return 'Perfect for fieldwork'
  if (text.includes('cloud')) return 'Good for most tasks'
  return 'Check conditions before going out'
}

function getWeatherIcon(condition) {
  const text = (condition || '').toLowerCase()
  if (text.includes('sunny') || text.includes('clear')) return 'sun'
  if (text.includes('partly cloudy')) return 'cloud-sun'
  if (text.includes('cloud') || text.includes('overcast')) return 'cloud'
  if (text.includes('fog') || text.includes('mist')) return 'cloud-fog'
  if (text.includes('drizzle')) return 'cloud-drizzle'
  if (text.includes('rain') || text.includes('shower')) return 'cloud-rain'
  if (text.includes('snow') || text.includes('sleet') || text.includes('ice')) return 'cloud-snow'
  if (text.includes('thunder')) return 'cloud-lightning'
  return 'cloud-sun'
}

export async function fetchWeatherForCity(city) {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY
  if (!city || !apiKey) return null

  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=5&aqi=no`
    )
    if (!res.ok) return null

    const data = await res.json()
    if (!data.current) return null

    const { location, current, forecast } = data
    const condition = current.condition.text

    return {
      location: `${location.name}, ${location.country}`,
      temp: Math.round(current.temp_c),
      feelsLike: Math.round(current.feelslike_c),
      humidity: current.humidity,
      precipitation: current.precip_mm,
      windSpeed: Math.round(current.wind_kph),
      condition,
      icon: getWeatherIcon(condition),
      advice: getFieldworkAdvice(condition, current.temp_c),
      forecast: (forecast?.forecastday || []).map(day => ({
        date: day.date,
        max: Math.round(day.day.maxtemp_c),
        min: Math.round(day.day.mintemp_c),
        precip: day.day.totalprecip_mm,
        condition: day.day.condition.text,
      })),
    }
  } catch {
    return null
  }
}
