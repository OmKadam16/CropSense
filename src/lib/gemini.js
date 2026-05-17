const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

function formatOverview(ctx) {
  const lines = ['You are CropSense AI, a precision agriculture assistant.']

  const farm = ctx.userFarm || {}
  const vision = ctx.vision || {}
  const texture = ctx.texture || {}
  const nutrients = ctx.nutrients || {}
  const crops = ctx.crops || []
  const pest = ctx.pest || {}
  const planner = ctx.planner || {}
  const weather = ctx.weather || {}
  const rawFarm = ctx.rawFarm || {}

  const sections = []

  const farmLines = []
  if (rawFarm.farm_size) farmLines.push(`- Farm Size: ${rawFarm.farm_size} acres`)
  if (rawFarm.soil_type) farmLines.push(`- Soil Type (user): ${rawFarm.soil_type.replace(/_/g, ' ')}`)
  if (rawFarm.climate) farmLines.push(`- Climate Zone: ${rawFarm.climate}`)
  if (rawFarm.water_source) farmLines.push(`- Water Source: ${rawFarm.water_source.replace(/_/g, ' ')}`)
  if (farm.city) farmLines.push(`- Location: ${farm.city}`)
  if (farm.cropType) farmLines.push(`- Crops Grown: ${farm.cropType}`)
  if (ctx.season) farmLines.push(`- Growing Season: ${ctx.season}`)
  if (ctx.method) farmLines.push(`- Farming Method: ${ctx.method}`)
  if (farmLines.length > 0) sections.push(`FARM PROFILE:\n${farmLines.join('\n')}`)

  const soilLines = []
  const healthScore = vision.confidence_score && texture.confidence_score && nutrients.confidence_score
    ? Math.round((vision.confidence_score + texture.confidence_score + nutrients.confidence_score) / 3)
    : null
  if (healthScore) soilLines.push(`- Overall Soil Health Score: ${healthScore}/100`)
  if (texture.texture_class) soilLines.push(`- Detected Texture: ${texture.texture_class}`)
  if (texture.sand_percentage) soilLines.push(`- Composition: ${texture.sand_percentage}% sand / ${texture.silt_percentage}% silt / ${texture.clay_percentage}% clay`)
  if (nutrients.pH_estimate) soilLines.push(`- pH: ${nutrients.pH_estimate} (${nutrients.pH_category || ''})`)
  if (nutrients.nitrogen_status) soilLines.push(`- Nitrogen (N): ${nutrients.nitrogen_status}`)
  if (nutrients.phosphorus_status) soilLines.push(`- Phosphorus (P): ${nutrients.phosphorus_status}`)
  if (nutrients.potassium_status) soilLines.push(`- Potassium (K): ${nutrients.potassium_status}`)
  if (nutrients.organic_matter_percent) soilLines.push(`- Organic Matter: ${nutrients.organic_matter_percent}%`)
  if (vision.moisture_level) soilLines.push(`- Moisture: ${vision.moisture_level}`)
  if (texture.drainage_rating) soilLines.push(`- Drainage: ${texture.drainage_rating}`)
  if (texture.water_holding_capacity) soilLines.push(`- Water Holding Capacity: ${texture.water_holding_capacity}`)
  if (nutrients.micronutrient_deficiencies?.length) soilLines.push(`- Micronutrient Deficiencies: ${nutrients.micronutrient_deficiencies.join(', ')}`)
  if (soilLines.length > 0) sections.push(`SOIL ANALYSIS:\n${soilLines.join('\n')}`)

  if (crops.length > 0) {
    const cropLines = crops.map((c, i) => {
      const match = c.matches_user_crops ? ' [YOU GROW THIS]' : ''
      return `  ${i + 1}. ${c.crop_name} — ${c.suitability_score}% suitability${match}`
    })
    sections.push(`TOP CROP RECOMMENDATIONS:\n${cropLines.join('\n')}`)
  }

  if (pest.high_risk_pests?.length) {
    const pestLines = pest.high_risk_pests.map(p => `  - ${p.pest_name} (${p.risk_level} risk)`)
    sections.push(`PEST RISKS:\n${pestLines.join('\n')}`)
  }

  if (planner.crop) {
    sections.push(`PLANTING PLAN:\n- Target Crop: ${planner.crop}\n- Planting Window: Month ${planner.planting_window_start_month || 'N/A'}`)
  }

  if (weather.temp !== undefined) {
    sections.push(`CURRENT WEATHER:\n- Location: ${weather.location || ''}\n- Temperature: ${weather.temp}°C (feels like ${weather.feelsLike}°C)\n- Condition: ${weather.condition}\n- Humidity: ${weather.humidity}%\n- Wind: ${weather.windSpeed} km/h`)
    if (weather.forecast?.length) {
      const fc = weather.forecast.slice(0, 3).map(d => `  - ${d.date}: ${d.condition}, ${d.min}-${d.max}°C`)
      sections.push(`3-DAY FORECAST:\n${fc.join('\n')}`)
    }
  }

  lines.push(...sections)
  lines.push('')
  lines.push('Provide concise, actionable farming advice (under 150 words). Reference specific data from the profile above. If asked about something not in the context, say you do not have that information. Answer in plain text or simple markdown.')

  return lines.join('\n\n')
}

let model = null
let chatSession = null

export async function initChat(contextData) {
  if (!API_KEY) return false
  try {
    chatSession = null
    model = null
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(API_KEY)
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const systemContext = formatOverview(contextData)

    chatSession = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Initialize with soil context data.' }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am CropSense AI, your precision agriculture assistant. I have loaded the soil analysis context and am ready to answer your questions about the farm data.' }],
        },
      ],
      systemInstruction: { role: 'system', parts: [{ text: systemContext }] },
    })
    return true
  } catch (err) {
    console.error('Gemini init error:', err)
    return false
  }
}

export async function sendMessage(message) {
  if (!chatSession) return 'Chat not initialized. Please refresh and try again.'
  try {
    const result = await chatSession.sendMessage(message)
    const response = await result.response
    return response.text()
  } catch (err) {
    console.error('Gemini send error:', err)
    if (err.message?.includes('SAFETY')) return 'I cannot answer that question due to safety guidelines. Please rephrase.'
    if (err.message?.includes('API_KEY')) return 'Invalid API key. Please check your Gemini API key configuration.'
    if (err.message?.includes('quota') || err.message?.includes('RATE_LIMIT')) return 'Rate limit reached. Please wait a moment and try again.'
    return 'Sorry, I encountered an error processing your question. Please try again.'
  }
}
