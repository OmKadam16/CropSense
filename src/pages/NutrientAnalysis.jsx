import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase } from '../lib/supabase'
import { useAnalysis } from '../lib/AnalysisContext'
import '../styles/PageCommon.css'
import './Dashboard.css'
import './NutrientAnalysis.css'

export default function NutrientAnalysis() {
  const [userName, setUserName] = useState(() => localStorage.getItem('username') || '')
  const [loading, setLoading] = useState(true)
  const { pipelineResult } = useAnalysis()
  const nut = pipelineResult?.nutrients || {}

  const [data, setData] = useState({
    nitrogen_status: nut.nitrogen_status || 'low',
    phosphorus_status: nut.phosphorus_status || 'medium',
    potassium_status: nut.potassium_status || 'high',
    organic_matter_status: nut.organic_matter_status || 'medium',
    organic_matter_percent: nut.organic_matter_percent || 4.8,
    pH_estimate: nut.pH_estimate || 6.5,
    pH_category: nut.pH_category || 'Slightly Acidic',
    micronutrient_deficiencies: nut.micronutrient_deficiencies || ['Zinc (Zn)', 'Iron (Fe)'],
    color_nutrient_clues: nut.color_nutrient_clues || 'Dark brown clay-loam context suggests healthy organic Carbon content with potential early leaching of highly soluble Nitrogen ions.',
    confidence_score: nut.confidence_score || 93,
    reasoning: nut.reasoning || 'pH levels are in the perfect neutral-to-acidic threshold (6.5), ideal for nutrient mobilization. Nitrogen depletion is identified and correction is recommended before planting.'
  })

  useEffect(() => {
    if (pipelineResult?.nutrients) {
      setData(prev => ({ ...prev, ...pipelineResult.nutrients }))
    }
  }, [pipelineResult?.nutrients])

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
        console.error('Error fetching nutrient data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <DashboardLayout activePage="nutrients">
      <header className="page-header">
        <div className="page-header-left">
          <div className="results-breadcrumb">
            <a href="/dashboard">Overview</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span>Nutrient Analysis</span>
          </div>
          <h1 className="page-title">Soil Nutrient Analysis</h1>
          <p className="page-subtitle">NPK values, organic compound saturation, and chemical balance.</p>
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

      <div className="nutrient-grid-page">
        {/* N-P-K Chemical Focus */}
        <div className="nutrient-col-primary">
          <section className="card-panel">
            <h2 className="card-panel-title">Macro Elements (N-P-K)</h2>
            <p className="section-desc">
              Essential chemical pillars required for cellular expansion, vigorous root growth, and seasonal resilience.
            </p>

            <div className="npk-cards-container">
              {/* Nitrogen Card */}
              <div className={`npk-card ${data.nitrogen_status}`}>
                <div className="npk-badge">N</div>
                <div className="npk-info">
                  <span className="npk-label">Nitrogen (Vegetative & Color)</span>
                  <div className="npk-status-row">
                    <span className="npk-status-val">{data.nitrogen_status.toUpperCase()}</span>
                    <span className="npk-status-indicator low" />
                  </div>
                  <p className="npk-advice">Action required: Consider tilling in rich composted manures or clover bio-crops.</p>
                </div>
              </div>

              {/* Phosphorus Card */}
              <div className={`npk-card ${data.phosphorus_status}`}>
                <div className="npk-badge">P</div>
                <div className="npk-info">
                  <span className="npk-label">Phosphorus (Root & Flower Development)</span>
                  <div className="npk-status-row">
                    <span className="npk-status-val">{data.phosphorus_status.toUpperCase()}</span>
                    <span className="npk-status-indicator medium" />
                  </div>
                  <p className="npk-advice">Balanced: Suitable for starting growth. Keep monitored throughout early season.</p>
                </div>
              </div>

              {/* Potassium Card */}
              <div className={`npk-card ${data.potassium_status}`}>
                <div className="npk-badge">K</div>
                <div className="npk-info">
                  <span className="npk-label">Potassium (Water Flow & Cell Health)</span>
                  <div className="npk-status-row">
                    <span className="npk-status-val">{data.potassium_status.toUpperCase()}</span>
                    <span className="npk-status-indicator high" />
                  </div>
                  <p className="npk-advice">Excellent: Offers optimal frost-resistance, stem strength, and yield metrics.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card-panel">
            <h2 className="card-panel-title">Active Organic Matter</h2>
            <div className="organic-matter-section">
              <div className="organic-gauge">
                <div className="organic-circle">
                  <div className="organic-circle-value">{data.organic_matter_percent}%</div>
                  <div className="organic-circle-label">Organic Carbon</div>
                </div>
              </div>
              <div className="organic-details">
                <div className="organic-status-header">
                  <h3>Condition: {data.organic_matter_status.toUpperCase()}</h3>
                  <span className="organic-health-badge">Good Standing</span>
                </div>
                <p className="organic-details-text">
                  Your organic soil carbon levels are measured at <strong>{data.organic_matter_percent}%</strong>. This level provides adequate microbial activity and soil crumb stability, assisting water retention.
                </p>
                <div className="soil-action-pill">
                  Target: Keep above 4.0% for sustainable cultivation.
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Acidity & Trace Deficiencies */}
        <div className="nutrient-col-secondary">
          <section className="card-panel ph-scale-card">
            <h2 className="card-panel-title">Soil Acidity (pH)</h2>
            <div className="ph-gauge-container">
              <div className="ph-value-display">{data.pH_estimate}</div>
              <span className="ph-category-badge">{data.pH_category}</span>
            </div>
            
            {/* Visual pH Slider */}
            <div className="ph-slider-track">
              <div className="ph-scale-markers">
                <span>4.0</span>
                <span>5.0</span>
                <span>6.0</span>
                <span className="optimal">7.0</span>
                <span>8.0</span>
                <span>9.0</span>
              </div>
              <div className="ph-slider-bar">
                <div className="ph-slider-pointer" style={{ left: `${((data.pH_estimate - 4) / 5) * 100}%` }} />
              </div>
              <div className="ph-scale-legend">
                <span>Highly Acidic</span>
                <span>Neutral</span>
                <span>Alkaline</span>
              </div>
            </div>
            <p className="ph-advice-text">
              A soil pH of {data.pH_estimate} is optimal for most local cash-crops, promoting efficient macronutrient uptake without heavy aluminum toxicity risks.
            </p>
          </section>

          <section className="card-panel micronutrients-card">
            <h2 className="card-panel-title">Micronutrient Deficiencies</h2>
            <p className="section-desc">Suspended trace minerals crucial for chlorophyll synthesis and leaf enzymatic actions.</p>
            
            <div className="deficiency-list">
              <div className="deficiency-item warning">
                <div className="deficiency-icon-wrap">!</div>
                <div className="deficiency-info">
                  <span className="deficiency-name">Zinc (Zn) - Suspected Depletion</span>
                  <p className="deficiency-desc">Zinc binds to high organic fractions. Application of standard chelated zinc is advised.</p>
                </div>
              </div>

              <div className="deficiency-item warning">
                <div className="deficiency-icon-wrap">!</div>
                <div className="deficiency-info">
                  <span className="deficiency-name">Iron (Fe) - Trace Deficit</span>
                  <p className="deficiency-desc">Low levels can slow leaf growth rates. Spray foliar iron complex if chlorosis signs develop.</p>
                </div>
              </div>

              <div className="deficiency-item secure">
                <div className="deficiency-icon-wrap">✓</div>
                <div className="deficiency-info">
                  <span className="deficiency-name">Manganese (Mn) - Adequate</span>
                  <p className="deficiency-desc">Fully sufficient levels detected. No supplement actions required.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card-panel diagnostic-card">
            <div className="diagnostic-header">
              <div className="diagnostic-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <h3 className="diagnostic-title">Soil Color Clues</h3>
            </div>
            <p className="diagnostic-text">{data.color_nutrient_clues}</p>
            <div className="diagnostic-footer">
              <span>Calibration Confidence: {data.confidence_score}%</span>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
