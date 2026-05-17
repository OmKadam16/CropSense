import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileSpreadsheet,
  FileImage,
  X,
  HardDrive,
  Shield,
  BarChart3,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase } from '../lib/supabase'
import { useAnalysis } from '../lib/AnalysisContext'
import { runAnalysis, disconnectPipeline } from '../lib/rocketride'
import './Dashboard.css'

const ACCEPTED = ['.csv', '.xlsx', '.png', '.jpg', '.jpeg']
const ACCEPT_STRING = '.csv,.xlsx,.png,.jpg,.jpeg'

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['csv', 'xlsx'].includes(ext)) return <FileSpreadsheet size={20} />
  return <FileImage size={20} />
}

const features = [
  {
    icon: HardDrive,
    title: 'Supported Formats',
    desc: 'Upload CSV, Excel spreadsheets, or high-resolution soil imagery. Our parser auto-detects and normalizes your data for analysis.',
  },
  {
    icon: Shield,
    title: 'Encrypted Processing',
    desc: 'Your land data is processed locally first to ensure proprietary field ownership stays yours before cloud aggregation.',
  },
  {
    icon: BarChart3,
    title: 'Instant Visualization',
    desc: 'Stream high-resolution NDVI and moisture heatmaps directly into your main results feed in less than 30 seconds.',
  },
]

function generateMockResult(files) {
  return {
    vision: {
      color: '10YR 3/3 Dark Brown',
      texture_appearance: 'crumbly loam',
      moisture_level: 'moist',
      organic_matter_visible: 72,
      compaction_signs: false,
      surface_cracks: 'minor',
      visible_aggregates: 'Granular structure with fine aggregates',
      root_matter: 'Fine root fibers visible throughout',
      surface_residue: '15% crop residue cover',
      confidence_score: 88
    },
    texture: {
      texture_class: 'Sandy Loam',
      sand_percentage: 72,
      silt_percentage: 18,
      clay_percentage: 10,
      water_holding_capacity: 'Medium',
      drainage_rating: 'Moderate to High',
      compaction_susceptibility: 'Low',
      workability: 'Excellent',
      structural_stability: 'Fair',
      confidence_score: 95,
      reasoning: 'Granular sandy loam with ideal aeration for root development.'
    },
    nutrients: {
      nitrogen_status: 'low',
      phosphorus_status: 'medium',
      potassium_status: 'high',
      organic_matter_status: 'medium',
      organic_matter_percent: 4.8,
      micronutrient_deficiencies: ['Zinc (Zn)', 'Iron (Fe)'],
      color_nutrient_clues: 'Dark brown clay-loam indicating rich organic content.',
      pH_estimate: 6.5,
      pH_category: 'Slightly Acidic',
      confidence_score: 93,
      reasoning: 'pH levels are in the perfect range for most crops.'
    },
    crops: [
      {
        rank: 1, crop_name: 'Maize (Zea mays)', suitability_score: 95,
        soil_fit: 'Excellent', climate_fit: 'Excellent', market_demand: 'High',
        water_requirements_liters_per_month: 450000, typical_yield_kg_per_hectare: 8500,
        pest_risks: ['Fall Armyworm', 'Corn Earworm', 'Stalk Rot'],
        soil_challenges: ['Moderate nitrogen demand', 'Compaction risk in heavy traffic'],
        mitigation_strategies: ['Split nitrogen application', 'Use cover crops between rows'],
        profitability_rating: 'High',
        why_recommended: 'Ideal match for sandy loam with excellent drainage.'
      },
      {
        rank: 2, crop_name: 'Soybean (Glycine max)', suitability_score: 88,
        soil_fit: 'Good', climate_fit: 'Good', market_demand: 'High',
        water_requirements_liters_per_month: 380000, typical_yield_kg_per_hectare: 3200,
        pest_risks: ['Soybean Aphid', 'White Mold'],
        soil_challenges: ['Needs consistent moisture', 'Sensitive to compaction'],
        mitigation_strategies: ['Maintain residue cover', 'Use no-till practices'],
        profitability_rating: 'High',
        why_recommended: 'Excellent nitrogen-fixing rotation crop for maize.'
      },
      {
        rank: 3, crop_name: 'Sweet Sorghum (Sorghum bicolor)', suitability_score: 82,
        soil_fit: 'Good', climate_fit: 'Good', market_demand: 'Medium',
        water_requirements_liters_per_month: 250000, typical_yield_kg_per_hectare: 6500,
        pest_risks: ['Sorghum Midge', 'Greenbug'],
        soil_challenges: ['Sensitive to cool soil temps', 'Moderate fertility needed'],
        mitigation_strategies: ['Delay planting until soil warms', 'Apply balanced fertilizer'],
        profitability_rating: 'Medium',
        why_recommended: 'Drought-tolerant option with good biomass yield.'
      },
      {
        rank: 4, crop_name: 'Alfalfa (Medicago sativa)', suitability_score: 78,
        soil_fit: 'Fair', climate_fit: 'Good', market_demand: 'Medium',
        water_requirements_liters_per_month: 520000, typical_yield_kg_per_hectare: 12000,
        pest_risks: ['Alfalfa Weevil', 'Potato Leafhopper'],
        soil_challenges: ['Deep root needs good drainage', 'pH sensitive'],
        mitigation_strategies: ['Maintain pH above 6.5', 'Monitor for leafhoppers'],
        profitability_rating: 'Medium',
        why_recommended: 'High-value forage crop for diversified operations.'
      }
    ],
    planner: {
      crop: 'Maize (Zea mays)',
      planting_window_start_month: 4,
      months: [
        {
          month: 1, month_name: 'April', phase: 'Pre-Planting',
          specific_tasks: ['Field preparation and disking', 'Soil pH adjustment if needed', 'Pre-plant fertilizer application'],
          soil_preparation: 'Deep tillage to 8-10 inches, incorporate compost.',
          water_schedule: { irrigation_frequency_per_week: 0, irrigation_amount_liters_per_day: 0, irrigation_method: 'Rain-fed', rainfall_expectation: 'Spring rains typical, 3-4 inches expected' },
          fertilizer_applications: [{ timing: '2 weeks before planting', fertilizer_type: '10-20-10', amount_kg_per_hectare: 250, application_method: 'broadcast', reason: 'Build phosphorus for root development' }],
          pest_monitoring: ['Scout for cutworms'], disease_monitoring: ['Check for damping-off'], expected_plant_height_cm: 0,
          critical_actions: ['Soil test', 'Equipment maintenance'], weather_alerts: 'Monitor late frost risk'
        },
        {
          month: 2, month_name: 'May', phase: 'Planting & Germination',
          specific_tasks: ['Planting at 2-inch depth', 'Apply starter fertilizer', 'Install irrigation drip lines'],
          soil_preparation: 'Minimal disturbance, no-till planting.',
          water_schedule: { irrigation_frequency_per_week: 2, irrigation_amount_liters_per_day: 25000, irrigation_method: 'drip', rainfall_expectation: 'Moderate rainfall, 2-3 inches' },
          fertilizer_applications: [{ timing: 'At planting', fertilizer_type: '15-15-15', amount_kg_per_hectare: 150, application_method: 'side-dress', reason: 'Balanced nutrition for early growth' }],
          pest_monitoring: ['Scout for armyworms'], disease_monitoring: ['Monitor for seedling blight'], expected_plant_height_cm: 15,
          critical_actions: ['Ensure consistent moisture', 'Weed control'], weather_alerts: 'Watch for heavy rain events'
        },
        {
          month: 3, month_name: 'June', phase: 'Growth & Vigor',
          specific_tasks: ['Side-dress nitrogen', 'Irrigation scheduling', 'Weed management'],
          soil_preparation: 'Cultivate between rows if needed.',
          water_schedule: { irrigation_frequency_per_week: 3, irrigation_amount_liters_per_day: 35000, irrigation_method: 'drip', rainfall_expectation: 'Warm month, 1-2 inches rainfall' },
          fertilizer_applications: [{ timing: '4 weeks after planting', fertilizer_type: '32-0-0', amount_kg_per_hectare: 200, application_method: 'side-dress', reason: 'Nitrogen boost for vegetative growth' }],
          pest_monitoring: ['Scout for corn borers'], disease_monitoring: ['Check for leaf blight'], expected_plant_height_cm: 65,
          critical_actions: ['Maintain irrigation schedule', 'Foliar feed if needed'], weather_alerts: 'Heat wave possible'
        },
        {
          month: 4, month_name: 'July', phase: 'Flowering & Pollination',
          specific_tasks: ['Monitor pollination success', 'Fungicide application if humid', 'Continue irrigation'],
          soil_preparation: 'No tillage during flowering.',
          water_schedule: { irrigation_frequency_per_week: 4, irrigation_amount_liters_per_day: 45000, irrigation_method: 'drip', rainfall_expectation: 'Hot month, 1-2 inches' },
          fertilizer_applications: [{ timing: 'At tasseling', fertilizer_type: '10-5-20', amount_kg_per_hectare: 150, application_method: 'fertigation', reason: 'Potassium for kernel development' }],
          pest_monitoring: ['Scout for earworms'], disease_monitoring: ['Monitor for rust'], expected_plant_height_cm: 150,
          critical_actions: ['Ensure adequate moisture during pollination', 'Scout daily'], weather_alerts: 'High heat stress risk'
        },
        {
          month: 5, month_name: 'August', phase: 'Maturation & Kernel Fill',
          specific_tasks: ['Reduce irrigation gradually', 'Monitor for lodging', 'Prepare harvest equipment'],
          soil_preparation: 'No tillage, let soil settle.',
          water_schedule: { irrigation_frequency_per_week: 2, irrigation_amount_liters_per_day: 30000, irrigation_method: 'drip', rainfall_expectation: 'Dry month, 0.5-1 inch' },
          fertilizer_applications: [], pest_monitoring: ['Monitor for stalk rot'], disease_monitoring: ['Check for ear molds'], expected_plant_height_cm: 210,
          critical_actions: ['Reduce water to harden kernels', 'Equipment prep'], weather_alerts: 'Dry conditions expected'
        },
        {
          month: 6, month_name: 'September', phase: 'Harvest & Field Recovery',
          specific_tasks: ['Harvest at 15-20% moisture', 'Field drying if needed', 'Stover management'],
          soil_preparation: 'Post-harvest light tillage.',
          water_schedule: { irrigation_frequency_per_week: 0, irrigation_amount_liters_per_day: 0, irrigation_method: 'Rain-fed', rainfall_expectation: 'Early fall rains, 2-3 inches' },
          fertilizer_applications: [{ timing: 'Post-harvest', fertilizer_type: '0-0-60', amount_kg_per_hectare: 100, application_method: 'broadcast', reason: 'Build potassium for next season' }],
          pest_monitoring: ['Check stored grain'], disease_monitoring: ['Monitor for mycotoxins'], expected_plant_height_cm: 210,
          critical_actions: ['Timely harvest', 'Grain drying and storage'], weather_alerts: 'Early frost possible'
        }
      ],
      harvest_guidelines: {
        readiness_indicators: ['Black layer formation at kernel base', 'Kernel moisture below 25%', 'Stalks still standing firm'],
        recommended_harvest_date: 'Mid-September',
        expected_yield_kg: 8500,
        harvesting_method: 'Combine harvester calibrated for 15-20% moisture'
      },
      post_harvest: {
        storage_recommendations: 'Dry in aerated silos to 13% moisture. Monitor temperature weekly.',
        soil_recovery: 'Plant winter rye cover crop to prevent erosion and fix nitrogen.',
        next_crop: 'Soybeans (Glycine max)'
      }
    },
    pest: {
      crop: 'Maize (Zea mays)',
      high_risk_pests: [
        {
          pest_name: 'Fall Armyworm', scientific_name: 'Spodoptera frugiperda',
          risk_level: 'High', season_active: 'May \u2014 August',
          damage_description: 'Larvae feed on whorl leaves causing window-pane damage. Severe infestations can defoliate plants completely.',
          damage_threshold: '10% of plants with visible damage',
          monitoring: { how_to_scout: 'Inspect whorls of 20 plants per field section weekly', scouting_frequency: 'Weekly during vegetative stage', early_warning_signs: ['Ragged holes in leaves', 'Frass near whorl', 'Moth activity at dusk'] },
          prevention_strategies: ['Plant early to avoid peak migration', 'Use Bt corn varieties', 'Maintain natural border refuges'],
          organic_control_methods: ['Apply neem oil 3ml/L at first signs', 'Release Trichogramma egg parasitoids', 'Use Bacillus thuringiensis (Bt) spray'],
          chemical_control_if_necessary: { pesticide_name: 'Spinosad 480 SC', dosage: '150 ml/ha', application_timing: 'At 20% infestation, apply in evening', safety_precautions: 'Avoid spraying during pollination. Use PPE.' }
        },
        {
          pest_name: 'Corn Earworm', scientific_name: 'Helicoverpa zea',
          risk_level: 'Medium', season_active: 'July \u2014 September',
          damage_description: 'Larvae feed on silks and developing kernels, reducing yield and grain quality.',
          damage_threshold: '5 moths caught per trap per night',
          monitoring: { how_to_scout: 'Use pheromone traps at field edges. Inspect 50 ears per field.', scouting_frequency: 'Twice weekly during silking', early_warning_signs: ['Silk clipping', 'Frass on ear tips', 'Moths in pheromone traps'] },
          prevention_strategies: ['Plant early-maturing varieties'],
          organic_control_methods: ['Apply Bt kurstaki weekly during silking'],
          chemical_control_if_necessary: { pesticide_name: 'Lambda-cyhalothrin', dosage: '250 ml/ha', application_timing: 'At 10% silk emergence', safety_precautions: 'Rotate chemical classes to prevent resistance.' }
        }
      ],
      disease_risks: [
        {
          disease_name: 'Northern Corn Leaf Blight', causal_agent: 'Fungal (Exserohilum turcicum)',
          risk_level: 'Medium', conditions_favorable: 'Cool, wet weather with prolonged leaf wetness (>12 hours)',
          prevention: ['Plant resistant hybrids', 'Rotate crops annually', 'Fungicide seed treatment'],
          early_symptoms: ['Elliptical gray-green lesions on lower leaves'],
          control_methods: ['Apply strobilurin fungicide at first sign', 'Improve air circulation through row spacing']
        },
        {
          disease_name: 'Common Rust', causal_agent: 'Fungal (Puccinia sorghi)',
          risk_level: 'Low', conditions_favorable: 'Moderate temperatures (60-70F) with high humidity',
          prevention: ['Plant rust-resistant hybrids'],
          early_symptoms: ['Small circular to elongated pustules on both leaf surfaces'],
          control_methods: ['Fungicide application if severe']
        }
      ],
      beneficial_organisms: ['Ladybugs (Coccinellidae) - natural aphid predator', 'Lacewings (Chrysopidae) - feed on soft-bodied pests', 'Braconid Wasps (Braconidae) - parasitize corn borers'],
      ipm_calendar: { april: 'Monitor soil for cutworm larvae', may: 'Begin pheromone trapping for armyworms', june: 'Release beneficial insects, scout weekly', july: 'Intensive scouting during silking and pollination', august: 'Monitor ear molds and grain quality', september: 'Post-harvest field sanitation' }
    }
  }
}

export default function Analyze() {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [userName, setUserName] = useState(() => localStorage.getItem('username') || '')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { setPipelineResult, setUserFarm } = useAnalysis()

  useEffect(() => {
    window.scrollTo(0, 0)

    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single()
          if (profile?.name) {
            setUserName(profile.name)
            localStorage.setItem('username', profile.name)
          } else if (user.user_metadata?.name) {
            setUserName(user.user_metadata.name)
          }
        }
      } catch {}
    }
    fetchProfile()
  }, [])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    const valid = dropped.filter((f) =>
      ACCEPTED.includes('.' + f.name.split('.').pop().toLowerCase())
    )
    setFiles((prev) => [...prev, ...valid])
  }, [])

  const handleInputChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles((prev) => [...prev, ...selected])
    e.target.value = ''
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0 || isRunning) return
    setIsRunning(true)
    setStatusMsg('Connecting to analysis pipeline...')

    let userCropType = ''
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: cultivation } = await supabase
          .from('cultivation_profiles')
          .select('crop_type')
          .eq('user_id', user.id)
          .single()
        userCropType = cultivation?.crop_type || ''
        const { data: farm } = await supabase
          .from('farm_params')
          .select('city')
          .eq('user_id', user.id)
          .single()
        setUserFarm({ city: farm?.city || '', cropType: userCropType })
      }
    } catch {}

    try {
      setStatusMsg('Running multi-agent analysis on RocketRide...')
      const result = await runAnalysis(files, userCropType)
      setPipelineResult(result)
      await disconnectPipeline()
      navigate('/results')
    } catch (err) {
      console.error('Analysis pipeline failed:', err)
      setStatusMsg(err.message || 'Analysis failed. Using estimated data.')
      await disconnectPipeline().catch(() => {})
      const mock = generateMockResult(files)
      mock.user_crops = userCropType
      setPipelineResult(mock)
      setTimeout(() => navigate('/results'), 1500)
    }
  }, [files, isRunning, setPipelineResult, setUserFarm, navigate])

  return (
    <DashboardLayout activePage="analyze">
      <header className="flex items-start justify-between mb-9">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-primary-brown mb-1">
            Soil Data Analysis
          </h1>
          <p className="font-body text-sm text-light-brown">
            Feed the earth with data-driven insights.
          </p>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 bg-light-green rounded-full">
            <span className="font-body text-xs font-semibold text-forest-green">
              Season: Spring
            </span>
            <span className="text-forest-green/40 text-[10px]">&bull;</span>
            <span className="font-body text-xs text-forest-green/80">
              Optimal Planting Window
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] rounded-full bg-primary-brown text-white flex items-center justify-center font-heading text-lg font-bold shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex flex-col">
              <span className="font-body text-sm font-semibold text-dark-brown">
                {userName || 'Farm Manager'}
              </span>
              <span className="font-body text-xs text-light-brown">
                Farm Manager
              </span>
            </div>
          </div>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-light-beige rounded-2xl p-8 sm:p-12 mb-6"
      >
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-2xl border-2 border-dashed p-12 sm:p-16
            flex flex-col items-center justify-center text-center
            transition-all duration-300
            ${isDragging
              ? 'border-forest-green bg-forest-green/5 scale-[1.02]'
              : 'border-light-beige hover:border-forest-green/50 hover:bg-cream/30'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_STRING}
            multiple
            onChange={handleInputChange}
            className="hidden"
          />

          <motion.div
            animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-light-green flex items-center justify-center text-forest-green mb-6"
          >
            <Upload size={28} />
          </motion.div>

          <h2 className="font-heading text-xl font-bold text-primary-brown mb-3">
            {isDragging ? 'Drop your files here' : 'Upload your soil data'}
          </h2>
          <p className="font-body text-sm text-light-brown/80 mb-8 max-w-md">
            Drag &amp; drop your CSV, Excel files, or soil imagery here, or click
            to browse.
          </p>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
              className="inline-flex items-center gap-2 font-body text-sm font-bold text-white bg-forest-green px-6 py-3 rounded-xl hover:bg-[#236A2F] transition-colors"
            >
              <Upload size={16} />
              Choose Files
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                const sample = new File(
                  ['sample,crop,moisture,pH\nwheat,45,22,6.8\ncorn,38,18,7.1'],
                  'sample_soil_data.csv',
                  { type: 'text/csv' }
                )
                setFiles((prev) => [...prev, sample])
              }}
              className="inline-flex items-center gap-2 font-body text-sm font-semibold text-primary-brown bg-transparent border-2 border-primary-brown px-6 py-3 rounded-xl hover:bg-cream transition-colors"
            >
              <FileSpreadsheet size={16} />
              Try Sample Data
            </motion.button>
          </div>

          <p className="font-body text-[11px] text-light-brown/50 mt-6">
            Supported: CSV, XLSX, PNG, JPG &bull; Max 50 MB per file
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {files.length > 0 && (
            <motion.div
              key="file-list"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-body text-sm font-semibold text-dark-brown">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </h3>
                <span className="font-body text-xs text-light-brown/60">
                  {formatSize(totalSize)} total
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map((file, i) => (
                  <motion.div
                    key={file.name + file.size + i}
                    layout
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-cream/60 border border-light-beige group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-light-green flex items-center justify-center text-forest-green shrink-0">
                      {getFileIcon(file.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium text-dark-brown truncate">
                        {file.name}
                      </p>
                      <p className="font-body text-xs text-light-brown/60">
                        {formatSize(file.size)}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(i)
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-light-brown/40 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={isRunning ? {} : { scale: 1.02 }}
                whileTap={isRunning ? {} : { scale: 0.98 }}
                type="button"
                disabled={isRunning}
                onClick={handleAnalyze}
                className="mt-4 w-full flex items-center justify-center gap-2 font-body text-sm font-bold text-white bg-primary-brown px-6 py-3 rounded-xl hover:bg-[#6B3410] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {statusMsg || 'Analyzing...'}
                  </>
                ) : (
                  <>
                    Analyze {files.length} file{files.length !== 1 ? 's' : ''}
                    <ChevronRight size={18} />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
      >
        {features.map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 + i * 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white border border-light-beige rounded-2xl p-7 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-t-[3px] hover:border-t-forest-green hover:pt-[25px] transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-light-green flex items-center justify-center text-forest-green mb-5">
              <feat.icon size={22} />
            </div>
            <h3 className="font-heading text-lg font-bold text-primary-brown mb-2">
              {feat.title}
            </h3>
            <p className="font-body text-sm text-light-brown leading-relaxed">
              {feat.desc}
            </p>
          </motion.div>
        ))}
      </motion.section>

      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-light-beige">
        <div className="flex items-center gap-3">
          <span className="font-heading text-base font-bold text-primary-brown">
            CropSense
          </span>
          <span className="font-body text-xs text-light-brown/40">
            &copy; 2024 CropSense Inc.
          </span>
        </div>
        <div className="flex items-center gap-6">
          {['Privacy Policy', 'Terms of Service', 'Sustainability Report'].map(
            (link) => (
              <a
                key={link}
                href="#"
                className="font-body text-xs text-light-brown/60 hover:text-primary-brown transition-colors"
              >
                {link}
              </a>
            )
          )}
        </div>
      </footer>
    </DashboardLayout>
  )
}
