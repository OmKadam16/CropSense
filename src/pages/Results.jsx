import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { supabase } from '../lib/supabase'
import { useAnalysis } from '../lib/AnalysisContext'
import '../styles/PageCommon.css'
import './Dashboard.css'
import './Results.css'

export default function Results() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState(() => localStorage.getItem('username') || '')
  const { pipelineResult } = useAnalysis()

  const vision = pipelineResult?.vision || {}
  const texture = pipelineResult?.texture || {}
  const nutrients = pipelineResult?.nutrients || {}
  const crops = pipelineResult?.crops || []
  const userCrops = pipelineResult?.user_crops || ''

  const healthScore = vision.confidence_score
    ? Math.round((vision.confidence_score + (texture.confidence_score || 85) + (nutrients.confidence_score || 80)) / 3)
    : 85

  const topCrop = crops[0]?.crop_name || 'Maize'
  const topCropMatch = crops[0]?.suitability_score || 95

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
          } else if (user.user_metadata?.name) {
            setUserName(user.user_metadata.name)
          }
        } else {
          const storedUser = localStorage.getItem('username')
          if (storedUser) {
            setUserName(storedUser)
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err)
        const storedUser = localStorage.getItem('username')
        if (storedUser) {
          setUserName(storedUser)
        }
      }
    }

    fetchProfile()
  }, [])

  const avatarLetter = userName.charAt(0).toUpperCase()

  return (
    <DashboardLayout activePage="results">
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-left">
          <div className="results-breadcrumb">
            <a href="/dashboard">Dashboard</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span>Vision Context & Synthesis</span>
          </div>
          <h1 className="page-title">Vision Context & Synthesis</h1>
          <p className="page-subtitle">Primary visual analysis of the crop/soil sample — {vision.color || 'Dark Brown'} soil, {vision.moisture_level || 'moist'}.</p>
        </div>

        <div className="page-header-right">
          <div className="season-context">
            <span className="season-label">Season: Spring</span>
            <span className="season-divider">&bull;</span>
            <span className="season-window">Optimal Planting Window</span>
          </div>
          <div className="user-profile">
            <div className="user-avatar">{avatarLetter}</div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">Farm Manager</span>
            </div>
          </div>
        </div>
      </header>

      {userCrops && (
        <div className="farm-profile-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22h20" /><path d="M12 2v20" /><path d="M8 6h8" />
          </svg>
          <span>Based on your farm profile: <strong>{userCrops}</strong></span>
        </div>
      )}

      <div className="results-columns" style={{ marginTop: userCrops ? '16px' : '24px' }}>
        {/* Left Side: Uploaded Image & Core Vision Diagnostics */}
        <div className="results-col-primary">
          {/* Soil Image Visual Context */}
          <section className="card-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="vision-image-banner">
              <div className="vision-image-overlay">
                <span className="vision-image-badge">Vision Context</span>
                <h3>Soil Sample Analysis</h3>
                <p>{vision.texture_appearance || 'Loam'} soil with {vision.organic_matter_visible || 70}% organic matter visible</p>
              </div>
            </div>
          </section>

          {/* Vision Analysis Diagnostics */}
          <section className="card-panel">
            <h2 className="card-panel-title" style={{ marginBottom: '16px' }}>AI Vision Diagnostics</h2>
            <div className="vision-diagnostics-grid">
              <div className="diagnostic-tile">
                <span className="tile-label">Soil Color</span>
                <span className="tile-value">{vision.color || '10YR 3/3 Dark Brown'}</span>
                <p className="tile-desc">{vision.visible_aggregates || 'High organic carbon matter.'}</p>
              </div>
              <div className="diagnostic-tile">
                <span className="tile-label">Surface Moisture</span>
                <span className="tile-value">{vision.moisture_level === 'moist' ? 'Moderately Moist' : vision.moisture_level || 'Moderately Moist'}</span>
                <p className="tile-desc">Surface cracks: {vision.surface_cracks || 'none'}. {vision.compaction_signs ? 'Compaction signs visible.' : 'No compaction signs.'}</p>
              </div>
              <div className="diagnostic-tile">
                <span className="tile-label">Surface Coverage</span>
                <span className="tile-value">{vision.surface_residue || '15% Plant Residue'}</span>
                <p className="tile-desc">Root matter: {vision.root_matter || 'Moderate root presence.'}</p>
              </div>
              <div className="diagnostic-tile">
                <span className="tile-label">AI Certainty</span>
                <span className="tile-value">{vision.confidence_score || 88}% Confidence</span>
                <p className="tile-desc">Visual analysis reliability score based on image quality and feature clarity.</p>
              </div>
            </div>
          </section>

          {/* The Core 5 Multi-Agent Specialized Reports (THE PORTAL GRID) */}
          <section className="card-panel">
            <h2 className="card-panel-title" style={{ marginBottom: '6px' }}>Specialized AI Analysis Reports</h2>
            <p className="card-panel-desc" style={{ marginBottom: '24px', fontSize: '0.88rem', color: 'var(--text-dark-secondary)' }}>
              Our RocketRide AI synthesis pipeline has compiled five distinct agricultural dimensions. Choose a report below to view detailed cards, recommendations, and metrics.
            </p>

            <div className="reports-portal-list">
              {/* 1. Texture */}
              <div className="report-portal-card" onClick={() => navigate('/results/texture')}>
                <div className="report-card-icon texture">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="report-card-info">
                  <div className="report-card-header-row">
                    <h4>Soil Physical Texture</h4>
                    <span className="report-badge">{texture.texture_class || 'Sandy Loam'}</span>
                  </div>
                  <p>Particle distribution: {texture.sand_percentage || 72}% sand / {texture.silt_percentage || 18}% silt / {texture.clay_percentage || 10}% clay.</p>
                </div>
                <div className="report-card-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* 2. Nutrients */}
              <div className="report-portal-card" onClick={() => navigate('/results/nutrients')}>
                <div className="report-card-icon nutrients">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                  </svg>
                </div>
                <div className="report-card-info">
                  <div className="report-card-header-row">
                    <h4>Soil Chemical Nutrients</h4>
                    <span className="report-badge">{nutrients.pH_estimate || 6.5} pH</span>
                  </div>
                  <p>N: {nutrients.nitrogen_status || 'low'} | P: {nutrients.phosphorus_status || 'medium'} | K: {nutrients.potassium_status || 'high'}.</p>
                </div>
                <div className="report-card-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* 3. Crops */}
              <div className="report-portal-card" onClick={() => navigate('/results/crops')}>
                <div className="report-card-icon crops">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 22h20" /><path d="M12 2v20" />
                  </svg>
                </div>
                <div className="report-card-info">
                  <div className="report-card-header-row">
                    <h4>Predictive Crop Selection</h4>
                    <span className="report-badge success">{topCrop} Match</span>
                  </div>
                  <p>Top match at {topCropMatch}% suitability with {crops.length} alternative crops considered.</p>
                </div>
                <div className="report-card-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* 4. Planner */}
              <div className="report-portal-card" onClick={() => navigate('/results/planner')}>
                <div className="report-card-icon planner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  </svg>
                </div>
                <div className="report-card-info">
                  <div className="report-card-header-row">
                    <h4>6-Month Season Planner</h4>
                    <span className="report-badge">{pipelineResult?.planner?.crop || 'Maize'}</span>
                  </div>
                  <p>{pipelineResult?.planner?.months?.length || 6}-month calendar starting month {pipelineResult?.planner?.planting_window_start_month || 4}.</p>
                </div>
                <div className="report-card-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* 5. Pest Control */}
              <div className="report-portal-card" onClick={() => navigate('/results/pest')}>
                <div className="report-card-icon pest">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="report-card-info">
                  <div className="report-card-header-row">
                    <h4>Pest & Disease Management</h4>
                    <span className="report-badge danger">{pipelineResult?.pest?.high_risk_pests?.length || 2} Active Risks</span>
                  </div>
                  <p>{pipelineResult?.pest?.high_risk_pests?.length || 2} pests, {pipelineResult?.pest?.disease_risks?.length || 2} diseases, {pipelineResult?.pest?.beneficial_organisms?.length || 3} beneficial organisms.</p>
                </div>
                <div className="report-card-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Quick Diagnostic Overview & Synthesis Pipeline Status */}
        <div className="results-col-secondary">
          <section className="card-panel health-summary-panel">
            <h3 className="card-panel-title" style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Agronomic Score</h3>
            <div className="health-score-ring">
              <div className="health-score-num">{healthScore}</div>
              <div className="health-score-total">/ 100</div>
            </div>
            <p className="health-verdict">{healthScore >= 80 ? 'EXCELLENT STANDING' : healthScore >= 60 ? 'GOOD STANDING' : 'NEEDS ATTENTION'}</p>
            <p className="health-meta-desc">Aggregate score from vision, texture, and nutrient analyses.</p>
          </section>

          <section className="card-panel map-card">
            <div className="map-placeholder" style={{ background: 'linear-gradient(135deg, #e3dfd5 0%, #ebdcc9 100%)', opacity: '1', height: '170px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5a2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: '0.8' }}>
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              </svg>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#684524' }}>Interactive Field Topology</span>
              <span style={{ fontSize: '0.72rem', color: '#88623b', marginTop: '-4px' }}>North Field Sector #4</span>
            </div>
          </section>

          <section className="pipeline-card">
            <h3 className="pipeline-title">RocketRide Pipeline</h3>
            <div className="pipeline-track">
              <div className="pipeline-step done">
                <div className="pipeline-dot" />
                <span className="pipeline-label">Vision Input</span>
              </div>
              <div className="pipeline-line fill" />
              <div className="pipeline-step done">
                <div className="pipeline-dot" />
                <span className="pipeline-label">Multi-Agent</span>
              </div>
              <div className="pipeline-line fill" />
              <div className="pipeline-step done">
                <div className="pipeline-dot" />
                <span className="pipeline-label">JSON Output</span>
              </div>
            </div>
            <div className="pipeline-progress-track">
              <div className="pipeline-progress-fill" style={{ width: '100%' }} />
            </div>
            <span className="pipeline-pct">100% synchronized</span>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
