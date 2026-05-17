import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase } from '../lib/supabase'
import '../styles/PageCommon.css'
import './Dashboard.css'
import './Settings.css'

export default function Settings() {
  const [name, setName] = useState(() => localStorage.getItem('username') || '')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('manager')
  const [timezone, setTimezone] = useState('est')
  const [soilType, setSoilType] = useState('sandy-loam')
  const [sensorDensity, setSensorDensity] = useState('standard')
  const [crops, setCrops] = useState(['Maize', 'Soybean'])
  const [newCrop, setNewCrop] = useState('')
  const [isAddingCrop, setIsAddingCrop] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)

    async function fetchProfileAndParams() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Fetch profile info
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            if (profile.name) {
              setName(profile.name)
              localStorage.setItem('username', profile.name)
            }
            if (profile.email) setEmail(profile.email)
          } else {
            if (user.user_metadata?.name) setName(user.user_metadata.name)
            if (user.email) setEmail(user.email)
          }

          // Fetch farm params calibration
          const { data: farm } = await supabase
            .from('farm_params')
            .select('soil_type')
            .eq('user_id', user.id)
            .limit(1)
            .single()

          if (farm?.soil_type) {
            setSoilType(farm.soil_type)
          }

          // Fetch cultivation crops
          const { data: cultivation } = await supabase
            .from('cultivation_profiles')
            .select('crop_type')
            .eq('user_id', user.id)
            .limit(1)
            .single()

          if (cultivation?.crop_type) {
            setCrops([cultivation.crop_type.charAt(0).toUpperCase() + cultivation.crop_type.slice(1)])
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err)
      }
    }

    fetchProfileAndParams()
  }, [])

  const handleSaveChanges = async () => {
    setSuccessMsg('')
    setErrorMsg('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user found')

      // Update profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update farm parameters
      const { error: farmError } = await supabase
        .from('farm_params')
        .update({ soil_type: soilType })
        .eq('user_id', user.id)

      if (farmError) {
        // Fallback: If no farm params row exists, insert it
        const { data: existingFarm } = await supabase
          .from('farm_params')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        if (!existingFarm || existingFarm.length === 0) {
          await supabase.from('farm_params').insert({
            user_id: user.id,
            soil_type: soilType,
            farm_size: '15 acres',
            climate: 'temperate',
            water_source: 'drip',
            city: 'General Location'
          })
        }
      }

      // Update cultivation crops
      if (crops.length > 0) {
        const primaryCrop = crops[0].toLowerCase()
        const { error: cultivationError } = await supabase
          .from('cultivation_profiles')
          .update({ crop_type: primaryCrop })
          .eq('user_id', user.id)

        if (cultivationError) {
          const { data: existingCult } = await supabase
            .from('cultivation_profiles')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)

          if (!existingCult || existingCult.length === 0) {
            await supabase.from('cultivation_profiles').insert({
              user_id: user.id,
              crop_type: primaryCrop,
              experience: 'intermediate',
              method: 'conventional',
              season: 'year_round'
            })
          }
        }
      }

      setSuccessMsg('Settings updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Error updating settings:', err)
      setErrorMsg(err.message || 'Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const addCrop = () => {
    if (newCrop.trim() && !crops.includes(newCrop.trim())) {
      setCrops([...crops, newCrop.trim()])
      setNewCrop('')
      setIsAddingCrop(false)
    }
  }

  const removeCrop = (indexToRemove) => {
    setCrops(crops.filter((_, i) => i !== indexToRemove))
  }

  const initial = name ? name.charAt(0).toUpperCase() : 'S'

  return (
    <DashboardLayout activePage="settings">
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Manage your soil profiles, farm parameters, and subscription tiers.</p>
        </div>
        <div className="page-header-right">
          <div className="season-context">
            <span className="season-label">Season: Spring</span>
            <span className="season-divider">&bull;</span>
            <span className="season-window">Optimal Planting Window</span>
          </div>
          <div className="user-profile">
            <div className="user-avatar">{initial}</div>
            <div className="user-info">
              <span className="user-name">{name}</span>
              <span className="user-role">Farm Manager</span>
            </div>
          </div>
        </div>
      </header>

      <div className="settings-form-container">
        {successMsg && <div className="settings-status success">{successMsg}</div>}
        {errorMsg && <div className="settings-status error">{errorMsg}</div>}

        <section className="card-panel">
          <div className="settings-avatar-row">
            <div className="settings-avatar">
              <span>{initial}</span>
              <button className="settings-avatar-edit" aria-label="Edit photo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Full Name"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                disabled 
                title="Email address cannot be changed directly" 
                placeholder="Email Address"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="owner">Farm Owner</option>
                <option value="manager">Farm Manager</option>
                <option value="agronomist">Agronomist</option>
                <option value="technician">Field Technician</option>
              </select>
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value="est">Eastern Time (EST/EDT)</option>
                <option value="cst">Central Time (CST/CDT)</option>
                <option value="mst">Mountain Time (MST/MDT)</option>
                <option value="pst">Pacific Time (PST/PDT)</option>
                <option value="utc">UTC / GMT</option>
              </select>
            </div>
          </div>
        </section>

        <section className="card-panel">
          <div className="settings-divider-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 22h20" /><path d="M12 2v20" /><path d="M6 6h4" /><path d="M14 6h4" /><path d="M6 10h4" /><path d="M14 10h4" /><path d="M6 14h12" />
            </svg>
            <h2 className="card-panel-title" style={{ margin: 0 }}>Farm Parameters</h2>
          </div>

          <div className="settings-form-grid">
            <div className="form-group form-group-full">
              <label>Primary Crop Species</label>
              <div className="crop-tags">
                {crops.map((crop, index) => (
                  <span className="crop-tag" key={crop}>
                    {crop}
                    <button className="crop-tag-remove" onClick={() => removeCrop(index)} aria-label="Remove">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
                
                {isAddingCrop ? (
                  <div className="crop-add-inline">
                    <input 
                      type="text" 
                      value={newCrop} 
                      onChange={(e) => setNewCrop(e.target.value)} 
                      placeholder="e.g. Corn"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && addCrop()}
                    />
                    <button onClick={addCrop} className="crop-add-confirm">Add</button>
                    <button onClick={() => setIsAddingCrop(false)} className="crop-add-cancel">Cancel</button>
                  </div>
                ) : (
                  <button className="crop-add-btn" onClick={() => setIsAddingCrop(true)}>+ Add Crop</button>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Soil Type Calibration</label>
              <select value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                <option value="sandy">Sandy</option>
                <option value="loamy">Loamy</option>
                <option value="clay">Clay</option>
                <option value="sandy-loam">Sandy Loam</option>
                <option value="silty">Silty</option>
              </select>
            </div>
            <div className="form-group">
              <label>Sensor Density Preference</label>
              <div className="segmented-control">
                <button 
                  className={`segmented-option${sensorDensity === 'economic' ? ' active' : ''}`}
                  onClick={() => setSensorDensity('economic')}
                >
                  Economic (1/ha)
                </button>
                <button 
                  className={`segmented-option${sensorDensity === 'standard' ? ' active' : ''}`}
                  onClick={() => setSensorDensity('standard')}
                >
                  Standard (5/ha)
                </button>
                <button 
                  className={`segmented-option${sensorDensity === 'precision' ? ' active' : ''}`}
                  onClick={() => setSensorDensity('precision')}
                >
                  Precision (12/ha)
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="card-panel">
          <div className="settings-divider-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <h2 className="card-panel-title" style={{ margin: 0 }}>Billing</h2>
          </div>

          <div className="billing-card">
            <div className="billing-summary-row">
              <div className="billing-summary-left">
                <span className="billing-plan-label">Current Plan: Growth Pro</span>
                <span className="billing-plan-note">Invoiced monthly &bull; Next billing on Nov 24, 2024</span>
              </div>
              <span className="billing-plan-price">$149 /mo</span>
            </div>

            <div className="billing-payment-row">
              <div className="billing-payment-info">
                <div className="billing-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div>
                  <span className="billing-card-name">Visa ending in 4429</span>
                  <span className="billing-card-expiry">Expires 06/27</span>
                </div>
              </div>
            </div>

            <div className="billing-actions">
              <button className="btn-billing-edit">Edit</button>
              <button className="btn-billing-upgrade">Upgrade Plan</button>
            </div>
          </div>
        </section>
      </div>

      <div className="settings-bottom-bar">
        <button 
          className={`btn-save-changes${loading ? ' loading' : ''}`} 
          onClick={handleSaveChanges}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </DashboardLayout>
  )
}
