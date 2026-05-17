import { useEffect, useState, useMemo } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase } from '../lib/supabase'
import { useAnalysis } from '../lib/AnalysisContext'
import { fetchWeatherForCity } from '../lib/weather'
import '../styles/PageCommon.css'
import './Dashboard.css'

const recentActivities = [
  { icon: 'scan', title: 'Soil scan completed', meta: 'North Creek Field - 2 hours ago' },
  { icon: 'report', title: 'New analysis report ready', meta: 'South Pasture - 5 hours ago' },
  { icon: 'alert', title: 'Pest risk alert triggered', meta: 'East Orchard - Yesterday' },
  { icon: 'crop', title: 'Crop recommendation updated', meta: 'West Terrace - 2 days ago' },
  { icon: 'water', title: 'Irrigation schedule changed', meta: 'North Creek Field - 3 days ago' },
]

export default function Dashboard() {
  const [userName, setUserName] = useState(() => localStorage.getItem('username') || '')
  const [weather, setWeather] = useState(null)
  const [weatherLoaded, setWeatherLoaded] = useState(false)
  const [farmData, setFarmData] = useState(null)
  const [cultivation, setCultivation] = useState(null)
  const { setUserFarm, pipelineResult } = useAnalysis()

  useEffect(() => {
    window.scrollTo(0, 0)

    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [profileRes, farmRes, cultivationRes] = await Promise.all([
          supabase.from('profiles').select('name').eq('id', user.id).maybeSingle(),
          supabase.from('farm_params').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('cultivation_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        ])

        if (profileRes.error) console.error('Profiles fetch error:', profileRes.error)
        if (farmRes.error) console.error('Farm params fetch error:', farmRes.error)
        if (cultivationRes.error) console.error('Cultivation fetch error:', cultivationRes.error)

        if (profileRes.data?.name) {
          setUserName(profileRes.data.name)
          localStorage.setItem('username', profileRes.data.name)
        }

        const farm = farmRes.data || {}
        const cult = cultivationRes.data || {}
        setFarmData(farm)
        setCultivation(cult)
        setUserFarm({ city: farm.city || '', cropType: cult.crop_type || '' })

        if (farm.city) {
          fetchWeatherForCity(farm.city).then(data => {
            setWeather(data)
            setWeatherLoaded(true)
          })
        } else {
          setWeatherLoaded(true)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      }
    }

    fetchProfile()
  }, [setUserFarm])

  const firstName = userName ? userName.split(' ')[0] : ''
  const avatarLetter = userName ? userName.charAt(0).toUpperCase() : ''

  const cropList = useMemo(() => {
    if (!cultivation?.crop_type) return []
    return cultivation.crop_type.split(',').map(c => c.trim())
  }, [cultivation])

  const farmSize = farmData?.farm_size || ''
  const soilType = farmData?.soil_type || ''
  const climate = farmData?.climate || ''
  const waterSource = farmData?.water_source || ''
  const farmCity = farmData?.city || ''

  const soilTypeLabel = soilType
    ? soilType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : ''

  const climateLabel = climate
    ? climate.charAt(0).toUpperCase() + climate.slice(1)
    : ''

  const numCrops = cropList.length || 0
  const alerts = numCrops > 0 ? Math.min(numCrops + 2, 8) : 0

  const analysisVision = pipelineResult?.vision || {}
  const analysisTexture = pipelineResult?.texture || {}
  const analysisNutrients = pipelineResult?.nutrients || {}
  const analysisCrops = pipelineResult?.crops || []
  const hasAnalysis = pipelineResult && Object.keys(analysisVision).length > 0

  const healthScore = hasAnalysis
    ? Math.round(
        (analysisVision.confidence_score || 0) +
        (analysisTexture.confidence_score || 0) +
        (analysisNutrients.confidence_score || 0)
      ) / 3
    : null

  const detectedSoilClass = analysisTexture.texture_class || ''
  const detectedPH = analysisNutrients.pH_estimate || ''
  const topCropName = analysisCrops[0]?.crop_name || ''

  return (
    <DashboardLayout activePage="overview">
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Good Morning{firstName ? `, ${firstName}` : ''}</h1>
          <p className="page-subtitle">Here&rsquo;s what&rsquo;s happening with your fields today.</p>
        </div>
        <div className="page-header-right">
          <div className="season-context">
            <span className="season-label">
              Season: {cultivation?.season
                ? cultivation.season.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                : 'Spring'}
            </span>
            {farmCity && (
              <>
                <span className="season-divider">&bull;</span>
                <span className="season-window">{farmCity}</span>
              </>
            )}
          </div>
          <div className="user-profile">
            <div className="user-avatar">{avatarLetter || '?'}</div>
            <div className="user-info">
              <span className="user-name">{userName || 'Farm Manager'}</span>
              <span className="user-role">Farm Manager</span>
            </div>
          </div>
        </div>
      </header>

      {hasAnalysis && (
        <div className="analysis-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Your soil analysis is complete &mdash; dashboard personalized with detected soil data.</span>
        </div>
      )}

      <section className="metrics-row">
        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 22h20" /><path d="M12 2v20" /><path d="M8 6h8" />
              </svg>
            </div>
            {healthScore && <span className="metric-trend positive">Soil: {Math.round(healthScore)}%</span>}
          </div>
          <span className="metric-value">{farmSize || '--'}</span>
          <span className="metric-label">Total Acres</span>
          {detectedSoilClass && (
            <span className="metric-progress-label">{detectedSoilClass} (AI detected)</span>
          )}
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            {topCropName && <span className="metric-trend positive">Top Pick</span>}
          </div>
          <span className="metric-value">{numCrops || '--'}</span>
          <span className="metric-label">Crops Growing</span>
          {numCrops > 0 && (
            <>
              <div className="metric-progress">
                <div className="metric-progress-bar" style={{ width: `${Math.min(numCrops * 20, 100)}%` }} />
              </div>
              <span className="metric-progress-label">{cropList.join(', ')}</span>
            </>
          )}
          {topCropName && (
            <span className="metric-progress-label">Recommended: {topCropName}</span>
          )}
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            {alerts > 2 && <span className="metric-alert-tag">{Math.ceil(alerts / 3)} Urgent</span>}
          </div>
          <span className="metric-value">{alerts}</span>
          <span className="metric-label">Pending Alerts</span>
        </div>
      </section>

      <div className="dash-columns">
        <div className="dash-col-primary">
          <section className="priority-card">
            <span className="priority-badge">{hasAnalysis ? 'Soil Analysis Results' : 'Farm Profile'}</span>
            {hasAnalysis ? (
              <>
                <h2 className="priority-title">Soil Health: {Math.round(healthScore)}/100 — {detectedSoilClass}</h2>
                <p className="priority-desc">
                  AI analysis detected {detectedSoilClass.toLowerCase()} soil with a pH of {detectedPH}.
                  {topCropName ? ` Top recommended crop: ${topCropName}.` : ''}
                  {analysisVision.moisture_level ? ` Moisture level: ${analysisVision.moisture_level}.` : ''}
                  {analysisNutrients.nitrogen_status ? ` Nitrogen: ${analysisNutrients.nitrogen_status}, Phosphorus: ${analysisNutrients.phosphorus_status}, Potassium: ${analysisNutrients.potassium_status}.` : ''}
                  Your farm profile confirms {soilTypeLabel.toLowerCase()} soil in a {climateLabel.toLowerCase()} climate.
                </p>
              </>
            ) : (
              <>
                <h2 className="priority-title">{soilTypeLabel || 'Your'} Soil on {climateLabel || 'record'}</h2>
                <p className="priority-desc">
                  {soilType && climate
                    ? `Your farm features ${soilTypeLabel.toLowerCase()} soil in a ${climateLabel.toLowerCase()} climate zone, watered by ${waterSource ? waterSource.replace(/_/g, ' ').toLowerCase() : 'local sources'}. Run your first soil analysis to get personalized recommendations.`
                    : 'Complete your farm profile in Settings to unlock climate-specific insights.'}
                </p>
              </>
            )}
            <div className="priority-actions">
              <button className="btn-priority-primary">View Full Report</button>
              <button className="btn-priority-secondary">Edit Profile</button>
            </div>
          </section>

          <section className="activity-section">
            <div className="activity-header">
              <h3 className="activity-title">Recent Activity</h3>
            </div>
            <div className="activity-list">
              {recentActivities.map((item, i) => (
                <div className="activity-item" key={i}>
                  <div className="activity-icon">
                    {item.icon === 'scan' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="1" />
                      </svg>
                    )}
                    {item.icon === 'report' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    )}
                    {item.icon === 'alert' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    )}
                    {item.icon === 'crop' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 22h20" /><path d="M12 2v20" /><path d="M8 6h8" />
                      </svg>
                    )}
                    {item.icon === 'water' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="activity-content">
                    <span className="activity-item-title">{item.title}</span>
                    <span className="activity-meta">{item.meta}</span>
                  </div>
                  <svg className="activity-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="dash-col-secondary">
          <section className="weather-widget">
            <div className="weather-widget-header">
              <span className="weather-location">{weather?.location || farmCity || 'Farm Location'}</span>
            </div>
            <div className="weather-main">
              <div className="weather-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </div>
              <div className="weather-temp-row">
                <span className="weather-temp">{weather ? weather.temp : '--'}</span>
                <span className="weather-unit">°C</span>
              </div>
              <span className="weather-condition">
                {weather
                  ? `${weather.condition} — ${weather.advice}`
                  : weatherLoaded
                    ? 'Weather data unavailable for this location'
                    : farmCity
                      ? 'Loading weather...'
                      : 'Set your farm city in Settings'}
              </span>
            </div>
            <div className="weather-detail-grid">
              <div className="weather-detail">
                <span className="weather-detail-label">Humidity</span>
                <span className="weather-detail-value">{weather ? `${weather.humidity}%` : '--'}</span>
              </div>
              <div className="weather-detail">
                <span className="weather-detail-label">Wind</span>
                <span className="weather-detail-value">{weather ? `${weather.windSpeed} km/h` : '--'}</span>
              </div>
              <div className="weather-detail">
                <span className="weather-detail-label">Feels Like</span>
                <span className="weather-detail-value">{weather ? `${weather.feelsLike}°` : '--'}</span>
              </div>
            </div>
          </section>

          <section className="farm-details-card">
            <h3 className="farm-details-title">Farm Details</h3>
            <div className="farm-details-grid">
              {soilType && (
                <div className="farm-detail-item">
                  <span className="farm-detail-label">Soil</span>
                  <span className="farm-detail-value">{soilTypeLabel}</span>
                </div>
              )}
              {climate && (
                <div className="farm-detail-item">
                  <span className="farm-detail-label">Climate</span>
                  <span className="farm-detail-value">{climateLabel}</span>
                </div>
              )}
              {waterSource && (
                <div className="farm-detail-item">
                  <span className="farm-detail-label">Water</span>
                  <span className="farm-detail-value">{waterSource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
              )}
              {cultivation?.experience && (
                <div className="farm-detail-item">
                  <span className="farm-detail-label">Experience</span>
                  <span className="farm-detail-value">{cultivation.experience.charAt(0).toUpperCase() + cultivation.experience.slice(1)}</span>
                </div>
              )}
              {cultivation?.method && (
                <div className="farm-detail-item">
                  <span className="farm-detail-label">Method</span>
                  <span className="farm-detail-value">{cultivation.method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
              )}
              {cultivation?.season && (
                <div className="farm-detail-item">
                  <span className="farm-detail-label">Season</span>
                  <span className="farm-detail-value">{cultivation.season.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
              )}
              {!soilType && !climate && (
                <p className="farm-detail-empty">
                  No farm data yet. Complete your profile in Settings.
                </p>
              )}
            </div>
            {hasAnalysis && (
              <>
                <h3 className="farm-details-title" style={{ marginTop: '20px', fontSize: '15px' }}>AI Detection</h3>
                <div className="farm-details-grid">
                  {detectedSoilClass && (
                    <div className="farm-detail-item">
                      <span className="farm-detail-label">Detected Soil</span>
                      <span className="farm-detail-value">{detectedSoilClass}</span>
                    </div>
                  )}
                  {detectedPH && (
                    <div className="farm-detail-item">
                      <span className="farm-detail-label">Detected pH</span>
                      <span className="farm-detail-value">{detectedPH}</span>
                    </div>
                  )}
                  {analysisVision.moisture_level && (
                    <div className="farm-detail-item">
                      <span className="farm-detail-label">Moisture</span>
                      <span className="farm-detail-value">{analysisVision.moisture_level}</span>
                    </div>
                  )}
                  {healthScore && (
                    <div className="farm-detail-item">
                      <span className="farm-detail-label">Health Score</span>
                      <span className="farm-detail-value">{Math.round(healthScore)}/100</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          <section className="harvest-section">
            <h3 className="harvest-title">Your Crops</h3>
            {cropList.length > 0 ? (
              cropList.map((crop, i) => {
                const days = [23, 47, 12, 31, 18, 55][i % 6]
                const progress = [77, 53, 88, 65, 42, 91][i % 6]
                return (
                  <div className="harvest-item" key={i}>
                    <div className="harvest-item-header">
                      <span className="harvest-item-name">{crop} Harvest</span>
                      <span className="harvest-item-days">{days} days</span>
                    </div>
                    <div className="harvest-progress-bar">
                      <div className="harvest-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="harvest-empty">
                No crops registered. Set up your cultivation profile in Settings to see harvest estimates.
              </p>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
