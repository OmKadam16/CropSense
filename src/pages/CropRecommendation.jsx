import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase } from '../lib/supabase'
import { useAnalysis } from '../lib/AnalysisContext'
import '../styles/PageCommon.css'
import './Dashboard.css'
import './CropRecommendation.css'

const DEFAULT_CROPS = [
  {
    rank: 1,
    crop_name: 'Maize (Zea mays)',
    suitability_score: 95,
    soil_fit: 'Excellent',
    climate_fit: 'Excellent',
    market_demand: 'High',
    water_requirements_liters_per_month: 450000,
    typical_yield_kg_per_hectare: 8500,
    profitability_rating: 'High',
    why_recommended: 'Maize is heavily favored by loam soils containing robust potassium stores. The loose texture guarantees deep root anchors and optimized irrigation efficiency.',
    pest_risks: ['Fall Armyworm', 'Corn Earworm'],
    soil_challenges: ['High Nitrogen Demand', 'Zinc Depletion Risk'],
    mitigation_strategies: ['Apply balanced nitrogen side-dress', 'Add chelated zinc to starter fertilizer']
  },
  {
    rank: 2,
    crop_name: 'Soybean (Glycine max)',
    suitability_score: 88,
    soil_fit: 'Excellent',
    climate_fit: 'Good',
    market_demand: 'High',
    water_requirements_liters_per_month: 380000,
    typical_yield_kg_per_hectare: 3200,
    profitability_rating: 'High',
    why_recommended: 'Excellent choice to counteract nitrogen deficit since Soybeans naturally synthesize nitrogen through Rhizobium bacteria. Perfectly matches sandy loam soils.',
    pest_risks: ['Soybean Aphid', 'Stink Bug'],
    soil_challenges: ['Iron Defect Susceptibility'],
    mitigation_strategies: ['Use iron-tolerant seed variety']
  },
  {
    rank: 3,
    crop_name: 'Sweet Sorghum (Sorghum bicolor)',
    suitability_score: 82,
    soil_fit: 'Good',
    climate_fit: 'Excellent',
    market_demand: 'Medium',
    water_requirements_liters_per_month: 250000,
    typical_yield_kg_per_hectare: 6500,
    profitability_rating: 'Medium',
    why_recommended: 'Drought-tolerant crop that can produce excellent yields even on sandy/porous soils with lower water retention capacities.',
    pest_risks: ['Sorghum Midge', 'Aphids'],
    soil_challenges: ['Moderate Salt Sensitivity'],
    mitigation_strategies: ['Ensure standard drainage flushing']
  },
  {
    rank: 4,
    crop_name: 'Alfalfa (Medicago sativa)',
    suitability_score: 78,
    soil_fit: 'Good',
    climate_fit: 'Good',
    market_demand: 'High',
    water_requirements_liters_per_month: 520000,
    typical_yield_kg_per_hectare: 12000,
    profitability_rating: 'High',
    why_recommended: 'Thrives in well-drained loams with a neutral pH. The highly active organic matter levels currently present will accelerate crop establishment.',
    pest_risks: ['Alfalfa Weevil', 'Blister Beetle'],
    soil_challenges: ['Poor Acid Tolerance'],
    mitigation_strategies: ['Monitor pH to keep above 6.3']
  }
]

export default function CropRecommendation() {
  const [userName, setUserName] = useState(() => localStorage.getItem('username') || '')
  const [loading, setLoading] = useState(true)
  const { pipelineResult } = useAnalysis()

  const pipelineCrops = pipelineResult?.crops || []
  const initialCrops = pipelineCrops.length > 0 ? pipelineCrops : DEFAULT_CROPS
  const [recommendations, setRecommendations] = useState(initialCrops)

  useEffect(() => {
    if (pipelineResult?.crops?.length > 0) {
      setRecommendations(pipelineResult.crops)
    }
  }, [pipelineResult?.crops])

  useEffect(() => {
    window.scrollTo(0, 0)

    async function fetchData() {
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
      } catch (err) {
        console.error('Error fetching crop recommendations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const primaryCrop = recommendations[0]
  const alternativeCrops = recommendations.slice(1)
  const userCrops = pipelineResult?.user_crops || ''

  return (
    <DashboardLayout activePage="crops">
      <header className="page-header">
        <div className="page-header-left">
          <div className="results-breadcrumb">
            <a href="/dashboard">Overview</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span>Crop Recommendations</span>
          </div>
          <h1 className="page-title">Crop Recommendations</h1>
          <p className="page-subtitle">AI-predicted planting suggestions sorted by soil suitability and financial returns.</p>
          {userCrops && (
            <div className="farm-profile-banner" style={{ marginTop: '12px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 22h20" /><path d="M12 2v20" /><path d="M8 6h8" />
              </svg>
              <span>Your crops: <strong>{userCrops}</strong></span>
            </div>
          )}
        </div>
        <div className="page-header-right">
          <div className="season-context">
            <span className="season-label">Season: Spring</span>
            <span className="season-divider">&bull;</span>
            <span className="season-window">Optimal Planting Window</span>
          </div>
          <div className="user-profile">
            <div className="user-avatar">{userName ? userName.charAt(0).toUpperCase() : '?'}</div>
            <div className="user-info">
              <span className="user-name">{userName || 'Farm Manager'}</span>
              <span className="user-role">Farm Manager</span>
            </div>
          </div>
        </div>
      </header>

      <div className="crops-container">
        {/* Primary Recommended Crop Card */}
        <section className="card-panel primary-crop-hero">
          <div className="primary-crop-header">
              <div className="primary-crop-badge">
                <span>RANK 1</span>
                <h2>{primaryCrop.crop_name}</h2>
                {primaryCrop.matches_user_crops && (
                  <span className="match-badge">You grow this</span>
                )}
              </div>
            <div className="primary-suitability">
              <div className="suitability-circle">
                <div className="suitability-val">{primaryCrop.suitability_score}%</div>
                <div className="suitability-lbl">Suitability Match</div>
              </div>
            </div>
          </div>

          <div className="primary-crop-body">
            <div className="primary-crop-summary">
              <h3>Why Recommended</h3>
              <p>{primaryCrop.why_recommended}</p>
            </div>

            <div className="primary-stats-grid">
              <div className="primary-stat-item">
                <span className="stat-label">Soil Fit</span>
                <span className="stat-value excellent">{primaryCrop.soil_fit || '--'}</span>
              </div>
              <div className="primary-stat-item">
                <span className="stat-label">Market Demand</span>
                <span className="stat-value excellent">{primaryCrop.market_demand || '--'}</span>
              </div>
              <div className="primary-stat-item">
                <span className="stat-label">Est. Yield (Hectare)</span>
                <span className="stat-value">{(primaryCrop.typical_yield_kg_per_hectare || 0).toLocaleString()} kg</span>
              </div>
              <div className="primary-stat-item">
                <span className="stat-label">Est. Profitability</span>
                <span className="stat-value excellent">{primaryCrop.profitability_rating || '--'}</span>
              </div>
            </div>
          </div>

          <div className="primary-crop-mitigation">
            <h3>Challenges & AI Mitigation Strategies</h3>
            <div className="mitigation-row">
              {(primaryCrop.soil_challenges || []).map((challenge, idx) => (
                <div className="mitigation-item-box" key={idx}>
                  <div className="challenge-bullet">{challenge}</div>
                  <div className="mitigation-detail">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {(primaryCrop.mitigation_strategies || [])[idx]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alternative Crops Grid */}
        <section className="alternatives-section">
          <h2 className="alternatives-title">Alternative Highly Suitable Crops</h2>
          
          <div className="alternatives-grid">
            {alternativeCrops.map(crop => (
              <div className="alternative-card" key={crop.rank}>
                <div className="alternative-card-header">
                  <div className="alt-rank-tag">RANK {crop.rank}</div>
                  {crop.matches_user_crops && <span className="match-badge small">You grow this</span>}
                  <div className="alt-match-pct">{crop.suitability_score}% Match</div>
                </div>
                
                <h3 className="alt-crop-name">{crop.crop_name}</h3>
                <p className="alt-crop-desc">{crop.why_recommended}</p>
                
                <div className="alt-crop-stats">
                  <div className="alt-stat-line">
                    <span className="alt-stat-lbl">Soil Match</span>
                    <span className="alt-stat-val positive">{crop.soil_fit || '--'}</span>
                  </div>
                  <div className="alt-stat-line">
                    <span className="alt-stat-lbl">Profit Margin</span>
                    <span className="alt-stat-val positive">{crop.profitability_rating || '--'}</span>
                  </div>
                  <div className="alt-stat-line">
                    <span className="alt-stat-lbl">Est. Yield</span>
                    <span className="alt-stat-val">{(crop.typical_yield_kg_per_hectare || 0).toLocaleString()} kg/ha</span>
                  </div>
                </div>

                <div className="alt-crop-footer">
                  <span className="alt-water-label">Water Demand</span>
                  <span className="alt-water-value">{((crop.water_requirements_liters_per_month || 0) / 1000).toFixed(0)}k Liters/Mo</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
