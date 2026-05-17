import { RocketRideClient } from 'rocketride'

const CONFIGURED_URI = import.meta.env.VITE_ROCKETRIDE_URI || 'http://localhost:5565'

const ENGINE_PORTS = [54619, 5565]

let client = null
let activePort = null

async function tryConnect(port) {
  const uri = `http://localhost:${port}`
  const c = new RocketRideClient({ uri, auth: 'opencode' })
  try {
    await c.connect()
    return c
  } catch {
    try { await c.disconnect() } catch {}
    return null
  }
}

async function getClient() {
  if (client) return client

  const configuredMatch = CONFIGURED_URI.match(/:(\d+)/)
  const configuredPort = configuredMatch ? parseInt(configuredMatch[1]) : 5565
  const allPorts = [configuredPort, ...ENGINE_PORTS.filter(p => p !== configuredPort)]

  for (const port of allPorts) {
    const c = await tryConnect(port)
    if (c) {
      client = c
      activePort = port
      console.log(`RocketRide connected on port ${port}`)
      return client
    }
  }

  throw new Error('Could not connect to RocketRide engine on any port')
}

function parseAgentText(text) {
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim()
    return JSON.parse(cleaned)
  } catch {
    try {
      return JSON.parse(text)
    } catch {
      return null
    }
  }
}

function extractAllObjects(str) {
  const objects = []
  let i = 0
  while (i < str.length) {
    if (str[i] === '{') {
      let depth = 0
      const start = i
      while (i < str.length) {
        if (str[i] === '{') depth++
        if (str[i] === '}') {
          depth--
          if (depth === 0) {
            try {
              const parsed = JSON.parse(str.substring(start, i + 1))
              objects.push(parsed)
            } catch {}
            i++
            break
          }
        }
        i++
      }
    } else {
      i++
    }
  }
  return objects
}

function parsePipelineOutput(textArray) {
  if (!textArray) return null

  const items = Array.isArray(textArray) ? textArray : [textArray]
  const allObjects = []

  for (const item of items) {
    if (typeof item !== 'string') continue
    const parsed = parseAgentText(item)
    if (parsed) {
      allObjects.push(parsed)
    } else {
      const extracted = extractAllObjects(item)
      allObjects.push(...extracted)
    }
  }

  const result = {}

  for (const parsed of allObjects) {
    if (parsed.visual_analysis) {
      result.vision = { ...parsed.visual_analysis }
    }
    if (parsed.texture_analysis) {
      result.texture = { ...parsed.texture_analysis }
    }
    if (parsed.nutrient_analysis) {
      result.nutrients = { ...parsed.nutrient_analysis }
    }
    if (parsed.crop_recommendations) {
      result.crops = [...parsed.crop_recommendations]
    }
    if (parsed.planting_calendar) {
      result.planner = { ...parsed.planting_calendar }
    }
    if (parsed.pest_management) {
      result.pest = { ...parsed.pest_management }
    }
  }

  return Object.keys(result).length > 0 ? result : null
}

const PIPE_CONFIG = {
  project_id: 'b1be4829-3b31-4f6b-b78e-434f3fbae67d',
  source: 'dropper_1',
  components: [
    { id: 'dropper_1', provider: 'dropper', name: 'Image Analysis', config: { hideForm: true, mode: 'Source', parameters: {}, type: 'dropper' } },
    { id: 'parse_1', provider: 'parse', config: {}, input: [{ lane: 'tags', from: 'dropper_1' }] },
    {
      id: 'image_vision_openai_1', provider: 'image_vision_openai', name: 'Vision Analysis',
      config: {
        profile: 'openai-4o-mini',
        'openai-4o-mini': {
          apikey: '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',
          systemPrompt: 'You are an expert soil scientist with 25 years of experience in soil analysis. Your task is to examine soil photos and extract detailed visual characteristics that indicate soil type, health, and composition. Be precise and scientific in your observations.',
          prompt: 'You are an expert soil scientist analyzing soil photos. Extract visual characteristics and return ONLY valid JSON, no markdown, no explanations.\n\n{\n  "visual_analysis": {\n    "color": "describe soil color (dark brown, reddish, light tan, etc)",\n    "texture_appearance": "sandy, silty, clayey, mixed, crumbly, etc",\n    "moisture_level": "dry, moist, or wet",\n    "organic_matter_visible": 0-100,\n    "compaction_signs": true or false,\n    "surface_cracks": "none, minor, moderate, or significant",\n    "visible_aggregates": "describe soil structure",\n    "root_matter": "describe visible roots",\n    "surface_residue": "describe plant material",\n    "confidence_score": 0-100\n  }\n}'
        }
      },
      input: [{ lane: 'image', from: 'parse_1' }]
    },
    {
      id: 'image_vision_openai_2', provider: 'image_vision_openai', name: 'Texture Classification',
      config: {
        profile: 'openai-4o-mini',
        'openai-4o-mini': {
          apikey: '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',
          systemPrompt: 'Classify and analyze soil texture based on the photo user provides to determine soil composition and physical properties',
          prompt: 'You are a soil texture specialist. Based on the soil observations provided, classify the texture and return ONLY valid JSON, no markdown:\n\n{\n  "texture_analysis": {\n    "texture_class": "clay, silty clay, sandy clay, clay loam, silty clay loam, sandy clay loam, loam, silt loam, sandy loam, loamy sand, sand, or silt",\n    "sand_percentage": 0-100,\n    "silt_percentage": 0-100,\n    "clay_percentage": 0-100,\n    "water_holding_capacity": "low, medium, or high",\n    "drainage_rating": "poor, imperfect, moderate, somewhat excessive, or excessive",\n    "compaction_susceptibility": "low, medium, or high",\n    "workability": "poor, fair, good, or excellent",\n    "structural_stability": "poor, fair, good, or excellent",\n    "confidence_score": 0-100,\n    "reasoning": "brief explanation"\n  }\n}'
        }
      },
      input: [{ lane: 'image', from: 'parse_1' }]
    },
    {
      id: 'image_vision_openai_3', provider: 'image_vision_openai', name: 'Nutrient assmt',
      config: {
        profile: 'openai-4o-mini',
        'openai-4o-mini': {
          apikey: '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',
          systemPrompt: 'Infer and estimate soil nutrient levels (NPK and micronutrients) from soil observations and characteristics',
          prompt: 'Based on the soil observations provided, estimate the soil nutrient status and pH. Return ONLY valid JSON, no markdown, no code blocks, no explanations. Start with { and end with }\n\n{\n  "nutrient_analysis": {\n    "nitrogen_status": "very low, low, medium, high, very high",\n    "phosphorus_status": "very low, low, medium, high, very high",\n    "potassium_status": "very low, low, medium, high, very high",\n    "organic_matter_status": "very low, low, medium, high, very high",\n    "organic_matter_percent": 0-20,\n    "micronutrient_deficiencies": ["zinc, iron, boron, etc"],\n    "color_nutrient_clues": "what color indicates",\n    "pH_estimate": 4.5-8.5,\n    "pH_category": "very acidic, acidic, neutral, alkaline, very alkaline",\n    "confidence_score": 0-100,\n    "reasoning": "brief explanation"\n  }\n}'
        }
      },
      input: [{ lane: 'image', from: 'parse_1' }]
    },
    {
      id: 'image_vision_openai_4', provider: 'image_vision_openai', name: 'Crop Recommender',
      config: {
        profile: 'openai-4o-mini',
        'openai-4o-mini': {
          apikey: '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',
          systemPrompt: 'Recommend the top 5 most suitable crops based on soil conditions, climate, and farm characteristics',
          prompt: 'Recommend the top 5 most suitable crops based on the soil and visual data. Return ONLY valid JSON, no markdown, no explanations. Each crop must have these exact fields:\n\n{\n  "crop_recommendations": [\n    {\n      "crop_name": "Crop name",\n      "suitability_score": 85,\n      "soil_fit": "description of soil fit",\n      "market_demand": "high, medium, or low",\n      "typical_yield_kg_per_hectare": 5000,\n      "profitability_rating": "high, medium, or low",\n      "why_recommended": "reason",\n      "soil_challenges": "challenges",\n      "mitigation_strategies": "how to mitigate"\n    }\n  ]\n}'
        }
      },
      input: [{ lane: 'image', from: 'parse_1' }]
    },
    {
      id: 'image_vision_openai_5', provider: 'image_vision_openai', name: 'Season planner',
      config: {
        profile: 'openai-4o-mini',
        'openai-4o-mini': {
          apikey: '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',
          systemPrompt: 'Create a detailed 6-month planting calendar with specific tasks, water schedules, and fertilizer application timing',
          prompt: 'Create a 6-month planting calendar based on soil data. Return ONLY valid JSON, no markdown, no explanations, with these exact fields:\n\n{\n  "planting_calendar": {\n    "crop": "primary crop name",\n    "planting_window_start_month": 3,\n    "months": [\n      {\n        "name": "March",\n        "tasks": ["Prepare soil", "Plant seeds"],\n        "water_schedule": "Water every 3 days",\n        "fertilizer_application": "Apply balanced NPK"\n      }\n    ],\n    "harvest_guidelines": "guidelines",\n    "post_harvest": "post-harvest steps"\n  }\n}'
        }
      },
      input: [{ lane: 'image', from: 'parse_1' }]
    },
    {
      id: 'image_vision_openai_6', provider: 'image_vision_openai', name: 'Pest Management',
      config: {
        profile: 'openai-4o-mini',
        'openai-4o-mini': {
          apikey: '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',
          systemPrompt: 'Create a comprehensive pest and disease management plan with prevention, monitoring, and control strategies',
          prompt: 'Create a pest and disease management plan based on soil and crop data. Return ONLY valid JSON, no markdown, no explanations, with these exact fields:\n\n{\n  "pest_management": {\n    "crop": "primary crop name",\n    "high_risk_pests": [{"pest_name": "pest", "risk_level": "high", "description": "details"}],\n    "disease_risks": [{"name": "disease", "risk_level": "medium", "symptoms": "symptoms", "prevention": "prevention"}],\n    "beneficial_organisms": [{"name": "beneficial", "role": "controls pest X", "attraction_method": "plant Y"}],\n    "ipm_calendar": {\n      "March": "Apply neem oil",\n      "April": "Introduce beneficial insects"\n    }\n  }\n}'
        }
      },
      input: [{ lane: 'image', from: 'parse_1' }]
    },
    {
      id: 'response_text_4', provider: 'response_text', config: { laneName: 'text' },
      input: [
        { lane: 'text', from: 'image_vision_openai_1' },
        { lane: 'text', from: 'image_vision_openai_2' },
        { lane: 'text', from: 'image_vision_openai_3' },
        { lane: 'text', from: 'image_vision_openai_4' },
        { lane: 'text', from: 'image_vision_openai_5' },
        { lane: 'text', from: 'image_vision_openai_6' },
      ]
    }
  ]
}

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

export async function runAnalysis(files, userCropType) {
  if (!files || files.length === 0) throw new Error('No files provided')

  const c = await getClient()
  const config = { ...PIPE_CONFIG, project_id: generateId() }
  const startResult = await c.use({ pipeline: config, threads: 6 })
  const token = startResult.token

  const fileObjects = files.map((f) => ({ file: f }))
  const uploadResults = await c.sendFiles(fileObjects, token)

  let allTexts = []
  for (const upload of uploadResults) {
    if (upload.result?.text) {
      allTexts = allTexts.concat(upload.result.text)
    }
    if (upload.result?.result_types) {
      for (const [lane, type] of Object.entries(upload.result.result_types)) {
        if (type === 'text' && upload.result[lane]) {
          const texts = Array.isArray(upload.result[lane])
            ? upload.result[lane]
            : [upload.result[lane]]
          allTexts = allTexts.concat(texts)
        }
      }
    }
  }
  allTexts = [...new Set(allTexts)]

  const parsed = parsePipelineOutput(allTexts)
  if (parsed && Object.keys(parsed).length > 0) {
    if (userCropType) {
      const userCrops = userCropType.split(',').map(c => c.trim().toLowerCase())
      const crops = parsed.crops || []
      const tagged = crops.map(c => {
        const matches = userCrops.some(uc => (c.crop_name || '').toLowerCase().includes(uc))
        return { ...c, matches_user_crops: matches }
      })
      tagged.sort((a, b) => {
        if (a.matches_user_crops && !b.matches_user_crops) return -1
        if (!a.matches_user_crops && b.matches_user_crops) return 1
        return (a.suitability_score || 0) > (b.suitability_score || 0) ? -1 : 1
      })
      parsed.crops = tagged
      parsed.user_crops = userCropType
    }
    return parsed
  }

  return { raw: allTexts, user_crops: userCropType || '' }
}

export async function disconnectPipeline() {
  if (client) {
    try {
      await client.disconnect()
    } catch {}
    client = null
    activePort = null
  }
}

export function getActivePort() {
  return activePort
}
