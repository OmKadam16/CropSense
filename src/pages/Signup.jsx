import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

const steps = ['Credentials', 'Farm Details', 'Cultivation']

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [farmSize, setFarmSize] = useState('')
  const [soilType, setSoilType] = useState('')
  const [climate, setClimate] = useState('')
  const [waterSource, setWaterSource] = useState('')
  const [city, setCity] = useState('')

  const [cropType, setCropType] = useState('')
  const [experience, setExperience] = useState('')
  const [method, setMethod] = useState('')
  const [season, setSeason] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (data?.user) {
      const userId = data.user.id

      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          name,
          email,
        },
      ])

      if (profileError) console.error('Profile insert error:', profileError)

      const { error: farmError } = await supabase.from('farm_params').insert([
        {
          user_id: userId,
          farm_size: farmSize,
          soil_type: soilType,
          climate,
          water_source: waterSource,
          city,
        },
      ])

      if (farmError) console.error('Farm params insert error:', farmError)

      const { error: cultivationError } = await supabase
        .from('cultivation_profiles')
        .insert([
          {
            user_id: userId,
            crop_type: cropType,
            experience,
            method,
            season,
          },
        ])

      if (cultivationError)
        console.error('Cultivation insert error:', cultivationError)
    }

    localStorage.setItem('username', name)
    navigate('/onboarding')
  }

  const nextStep = () => {
    setError('')
    if (step === 0) {
      if (!name || !email || !password) {
        setError('Please fill in all fields')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
    }
    if (step === 1) {
      if (!farmSize || !soilType || !climate || !waterSource || !city) {
        setError('Please fill in all farm details')
        return
      }
    }
    setStep((s) => s + 1)
  }

  const prevStep = () => {
    setError('')
    setStep((s) => s - 1)
  }

  const renderProgress = () => (
    <div className="step-progress">
      {steps.map((_, i) => (
        <span key={i}>
          {i > 0 && (
            <span className={`step-line${i <= step ? ' done' : ''}`} />
          )}
          <span
            className={`step-dot${
              i === step ? ' active' : i < step ? ' done' : ''
            }`}
          />
        </span>
      ))}
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <Link to="/" className="auth-logo">CropSense</Link>
          {renderProgress()}

          {step > 0 && (
            <button className="auth-back" onClick={prevStep}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
          )}

          <form className="auth-form" onSubmit={step === 2 ? handleSignup : (e) => { e.preventDefault(); nextStep() }}>
            {error && <div className="auth-error">{error}</div>}

            {step === 0 && (
              <>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Start your soil analysis journey</p>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <button type="submit" className="btn-submit">
                  Continue
                </button>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="auth-title">Farm Details</h1>
                <p className="auth-subtitle">Tell us about your farm</p>

                <div className="form-group">
                  <label>Farm Size (acres)</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 acres"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Soil Type</label>
                  <select value={soilType} onChange={(e) => setSoilType(e.target.value)} required>
                    <option value="" disabled>Select soil type</option>
                    <option value="sandy">Sandy</option>
                    <option value="loamy">Loamy</option>
                    <option value="clay">Clay</option>
                    <option value="silty">Silty</option>
                    <option value="peaty">Peaty</option>
                    <option value="chalky">Chalky</option>
                    <option value="sandy_loam">Sandy Loam</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Climate Zone</label>
                  <select value={climate} onChange={(e) => setClimate(e.target.value)} required>
                    <option value="" disabled>Select climate zone</option>
                    <option value="tropical">Tropical</option>
                    <option value="dry">Dry / Arid</option>
                    <option value="temperate">Temperate</option>
                    <option value="continental">Continental</option>
                    <option value="mediterranean">Mediterranean</option>
                    <option value="polar">Polar / Cold</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Primary Water Source</label>
                  <select value={waterSource} onChange={(e) => setWaterSource(e.target.value)} required>
                    <option value="" disabled>Select water source</option>
                    <option value="rainfed">Rainfed</option>
                    <option value="well">Well / Groundwater</option>
                    <option value="canal">Canal / Irrigation</option>
                    <option value="river">River / Stream</option>
                    <option value="drip">Drip Irrigation</option>
                    <option value="sprinkler">Sprinkler System</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Pune, Maharashtra"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-submit">
                  Continue
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="auth-title">Cultivation Profile</h1>
                <p className="auth-subtitle">Help us personalize recommendations</p>

                <div className="form-group">
                  <label>Primary Crop Type</label>
                  <select value={cropType} onChange={(e) => setCropType(e.target.value)} required>
                    <option value="" disabled>Select primary crop</option>
                    <option value="wheat">Wheat</option>
                    <option value="rice">Rice</option>
                    <option value="corn">Corn / Maize</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="cotton">Cotton</option>
                    <option value="sugarcane">Sugarcane</option>
                    <option value="pulses">Pulses / Legumes</option>
                    <option value="mixed">Mixed Cropping</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Farming Experience</label>
                  <select value={experience} onChange={(e) => setExperience(e.target.value)} required>
                    <option value="" disabled>Select experience level</option>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="experienced">Experienced (5-10 years)</option>
                    <option value="expert">Expert (10+ years)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Farming Method</label>
                  <select value={method} onChange={(e) => setMethod(e.target.value)} required>
                    <option value="" disabled>Select farming method</option>
                    <option value="conventional">Conventional</option>
                    <option value="organic">Organic</option>
                    <option value="natural">Natural Farming</option>
                    <option value="permaculture">Permaculture</option>
                    <option value="hydroponic">Hydroponic</option>
                    <option value="integrated">Integrated Pest Management</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Growing Season</label>
                  <select value={season} onChange={(e) => setSeason(e.target.value)} required>
                    <option value="" disabled>Select growing season</option>
                    <option value="kharif">Kharif (Monsoon)</option>
                    <option value="rabi">Rabi (Winter)</option>
                    <option value="zaid">Zaid (Summer)</option>
                    <option value="year_round">Year Round</option>
                    <option value="multiple">Multiple Seasons</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className={`btn-submit${loading ? ' loading' : ''}`}
                  disabled={loading}
                >
                  Create Account
                </button>
              </>
            )}
          </form>

          {step === 0 && (
            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          )}
        </div>
      </div>

      <div className="auth-right">
        <img src="/img3.jpg" alt="Farming and soil" />
      </div>
    </div>
  )
}
