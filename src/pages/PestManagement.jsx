import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase } from '../lib/supabase'
import { useAnalysis } from '../lib/AnalysisContext'
import '../styles/PageCommon.css'
import './Dashboard.css'
import './PestManagement.css'

export default function PestManagement() {
  const [userName, setUserName] = useState(() => localStorage.getItem('username') || '')
  const [loading, setLoading] = useState(true)
  const { pipelineResult } = useAnalysis()
  const pestFromPipeline = pipelineResult?.pest || {}

  // Use pipeline data if available, otherwise default detailed pest data
  const [pestData, setPestData] = useState(pestFromPipeline.crop ? pestFromPipeline : {
    crop: 'Maize (Zea mays)',
    high_risk_pests: [
      {
        pest_name: 'Fall Armyworm',
        scientific_name: 'Spodoptera frugiperda',
        risk_level: 'High',
        season_active: 'May &mdash; August',
        damage_description: 'Larvae consume leaf tissue rapidly, leaving jagged skeletonized holes and devouring tassels.',
        damage_threshold: '10% of plants showing visible leaf feeding cycles.',
        monitoring: {
          how_to_scout: 'Inspect 50 plants across a W-shaped field pathway. Search the whorls for frass and larvae.',
          scouting_frequency: 'Bi-weekly during vegetative stages.',
          early_warning_signs: ['Small pinhole damage on leaves', 'Light brown frass deposits']
        },
        prevention_strategies: [
          'Intercrop with companion legumes (Push-Pull method).',
          'Optimize planting dates to avoid high moth flights.'
        ],
        organic_control_methods: [
          'Apply Bacillus thuringiensis (Bt) complex at sunset.',
          'Release Trichogramma parasitic wasps into egg zones.'
        ],
        chemical_control_if_necessary: {
          pesticide_name: 'Chlorantraniliprole (Coragen)',
          dosage: '150 ml per hectare',
          application_timing: 'Apply at early threshold breach',
          safety_precautions: 'Wear gloves and ensure clear personal safety gear.'
        }
      },
      {
        pest_name: 'Corn Earworm',
        scientific_name: 'Helicoverpa zea',
        risk_level: 'Medium',
        season_active: 'July &mdash; September',
        damage_description: 'Moths lay eggs on fresh silks. Larvae feed on developing kernels, causing heavy grain tip losses.',
        damage_threshold: '5 moths caught per trap per night during silking.',
        monitoring: {
          how_to_scout: 'Check fresh silk channels for egg deposits.',
          scouting_frequency: 'Every 3 days during green silk stage.'
        },
        prevention_strategies: [
          'Select tight-husk hybrid seed varieties.'
        ],
        organic_control_methods: [
          'Apply organic horticultural mineral oils to silks.'
        ]
      }
    ],
    disease_risks: [
      {
        disease_name: 'Northern Corn Leaf Blight',
        causal_agent: 'Fungal',
        risk_level: 'Medium',
        conditions_favorable: 'Warm, humid weather with frequent morning mists.',
        prevention: [
          'Rotate fields out of corn for 1-2 years.',
          'Chop and deeply plow down previous crop residues.'
        ],
        early_symptoms: ['Long, cigar-shaped greyish-green lesions on lower leaves'],
        control_methods: [
          'Apply preventative copper-based organic fungicides.',
          'Use resistant crop hybrids.'
        ]
      },
      {
        disease_name: 'Common Rust',
        causal_agent: 'Fungal',
        risk_level: 'Low',
        conditions_favorable: 'Cool temperatures (16-23°C) and high humidity.',
        prevention: [
          'Plant fully resistant hybrids.'
        ],
        early_symptoms: ['Cinnamon-brown pustules on both upper and lower leaf surfaces'],
        control_methods: [
          'No chemical controls needed unless infestation breaches 15% threshold.'
        ]
      }
    ],
    beneficial_organisms: [
      'Ladybugs (Coccinellidae) &mdash; feed extensively on aphids.',
      'Lacewings (Chrysopidae) &mdash; consume spider mites and insect eggs.',
      'Braconid Wasps &mdash; parasitize hornworms and armyworms.'
    ],
    ipm_calendar: {
      april: 'Set up pheromone moth traps along margins.',
      may: 'Begin weekly sweep-net inspections of seedlings.',
      june: 'Apply first Bt organic treatment if FAW signs breach 10% limit.',
      july: 'Inject mineral oils in silk lines at early silking.',
      august: 'Perform pre-harvest kernel boring insect checks.',
      september: 'Chop and plow back stalks to eliminate wintering larvae.'
    }
  })

  // Override from pipeline when data flow completes
  useEffect(() => {
    if (pestFromPipeline.crop) {
      setPestData(pestFromPipeline)
    }
  }, [pestFromPipeline.crop])

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
        console.error('Error fetching pest data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <DashboardLayout activePage="pest control">
      <header className="page-header">
        <div className="page-header-left">
          <div className="results-breadcrumb">
            <a href="/dashboard">Overview</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span>Pest Control</span>
          </div>
          <h1 className="page-title">Pest & Disease Management</h1>
          <p className="page-subtitle">Eco-friendly prevention guidelines, active monitoring thresholds, and control tactics.</p>
        </div>
        <div className="page-header-right">
          <div className="season-context">
            <span className="season-label">Active Crop: {pestData.crop}</span>
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

      <div className="pest-grid">
        {/* Left Column: High Risk Pests & Diseases */}
        <div className="pest-col-primary">
          <section className="card-panel">
            <h2 className="card-panel-title">High-Risk Pest Forecasts</h2>
            <p className="section-desc">Active insect populations identified as critical threats to crops in this texture profile.</p>

            <div className="pest-list">
              {pestData.high_risk_pests.map((pest, idx) => (
                <div className="pest-card-box" key={idx}>
                  <div className="pest-card-header-row">
                    <div>
                      <h3 className="pest-title-name">{pest.pest_name}</h3>
                      <span className="pest-latin">{pest.scientific_name}</span>
                    </div>
                    <div className={`pest-risk-tag ${pest.risk_level.toLowerCase()}`}>
                      {pest.risk_level} Risk
                    </div>
                  </div>

                  <p className="pest-damage-text"><strong>Damage Pattern:</strong> {pest.damage_description}</p>
                  
                  <div className="pest-meta-grid">
                    <div>
                      <strong>Active Season</strong>
                      <span dangerouslySetInnerHTML={{ __html: pest.season_active }} />
                    </div>
                    <div>
                      <strong>Action Threshold</strong>
                      <span>{pest.damage_threshold}</span>
                    </div>
                  </div>

                  <div className="pest-details-accordion">
                    <div className="accordion-section">
                      <h4>Scouting Guidelines</h4>
                      <p>{pest.monitoring.how_to_scout}</p>
                    </div>

                    <div className="accordion-section-row">
                      <div>
                        <h4>Organic Controls</h4>
                        <ul>
                          {pest.organic_control_methods.map((method, mIdx) => (
                            <li key={mIdx}>{method}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4>Prevention Tactics</h4>
                        <ul>
                          {pest.prevention_strategies.map((strat, sIdx) => (
                            <li key={sIdx}>{strat}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {pest.chemical_control_if_necessary && (
                      <div className="chemical-backup-box">
                        <h5>Emergency Chemical Backup</h5>
                        <p><strong>Pesticide:</strong> {pest.chemical_control_if_necessary.pesticide_name} ({pest.chemical_control_if_necessary.dosage})</p>
                        <p><strong>Timing:</strong> {pest.chemical_control_if_necessary.application_timing}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card-panel">
            <h2 className="card-panel-title">Disease Vector Assessments</h2>
            <div className="disease-cards-container">
              {pestData.disease_risks.map((disease, idx) => (
                <div className="disease-card" key={idx}>
                  <div className="disease-card-header">
                    <div>
                      <h3 className="disease-name-title">{disease.disease_name}</h3>
                      <span className="disease-agent">{disease.causal_agent} Agent</span>
                    </div>
                    <span className={`disease-risk-badge ${disease.risk_level.toLowerCase()}`}>{disease.risk_level} Risk</span>
                  </div>

                  <div className="disease-body">
                    <p><strong>Favorable Environment:</strong> {disease.conditions_favorable}</p>
                    <p><strong>Early Symptoms:</strong> {disease.early_symptoms[0]}</p>
                    
                    <div className="disease-action-bullets">
                      <div>
                        <strong>Prevention Guidelines:</strong>
                        <ul>
                          {disease.prevention.map((prev, pIdx) => (
                            <li key={pIdx}>{prev}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: IPM Calendar & Beneficial Bugs */}
        <div className="pest-col-secondary">
          <section className="card-panel ipm-calendar-card">
            <h2 className="card-panel-title">IPM Calendar Activities</h2>
            <p className="section-desc">Integrated Pest Management (IPM) seasonal interventions mapped month-by-month.</p>
            
            <div className="ipm-calendar-timeline">
              {Object.entries(pestData.ipm_calendar).map(([month, activity]) => (
                <div className="ipm-timeline-item" key={month}>
                  <span className="ipm-month-label">{month.charAt(0).toUpperCase() + month.slice(1)}</span>
                  <p className="ipm-activity-text">{activity}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card-panel beneficials-card">
            <h2 className="card-panel-title">Eco-Allies: Beneficial Organisms</h2>
            <p className="section-desc">Encourage these native predators to establish organic biological control in your fields.</p>
            
            <ul className="beneficials-list">
              {pestData.beneficial_organisms.map((bug, idx) => (
                <li key={idx} className="beneficial-item-box">
                  <div className="beneficial-icon">🐞</div>
                  <span className="beneficial-text" dangerouslySetInnerHTML={{ __html: bug }} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
