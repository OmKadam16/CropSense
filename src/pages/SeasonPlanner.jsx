import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase } from '../lib/supabase'
import { useAnalysis } from '../lib/AnalysisContext'
import '../styles/PageCommon.css'
import './Dashboard.css'
import './SeasonPlanner.css'

export default function SeasonPlanner() {
  const [userName, setUserName] = useState(() => localStorage.getItem('username') || '')
  const [loading, setLoading] = useState(true)
  const [activeMonthIdx, setActiveMonthIdx] = useState(0)
  const { pipelineResult } = useAnalysis()
  const planner = pipelineResult?.planner || {}

  // Use pipeline data if available, otherwise use detailed defaults inline
  const [calendar, setCalendar] = useState({
    crop: 'Maize (Zea mays)',
    planting_window_start_month: 4, // April
    months: [
      {
        month: 1,
        month_name: 'April',
        phase: 'Pre-Planting',
        specific_tasks: [
          'Till upper 15cm layer to break up soil aggregates.',
          'Incorporate balanced organic manure compost at 2 tons/acre.',
          'Prepare drip lines and perform water-pressure tests.'
        ],
        soil_preparation: 'Spread primary dynamic nutrients evenly. Keep dry and porous.',
        water_schedule: {
          irrigation_frequency_per_week: 1,
          irrigation_amount_liters_per_day: 15,
          irrigation_method: 'Drip lines',
          rainfall_expectation: 'Low rainfall. Primary source remains artificial irrigation.'
        },
        fertilizer_applications: [
          {
            timing: 'Pre-planting starter',
            fertilizer_type: 'N-P-K 10-20-10 starter boost',
            amount_kg_per_hectare: 120,
            application_method: 'Broadcast & Incorporate',
            reason: 'Compensate for identified Nitrogen and Zinc trace depletion.'
          }
        ],
        pest_monitoring: ['Scout for early cutworms in soil lines'],
        disease_monitoring: ['Monitor leaf blight clues in seedlings'],
        expected_plant_height_cm: 0,
        critical_actions: ['Complete starter nutrient broadcast before April 15.'],
        weather_alerts: 'Watch for late frost cycles in the early third of the month.'
      },
      {
        month: 2,
        month_name: 'May',
        phase: 'Planting & Germination',
        specific_tasks: [
          'Sow seeds at 5cm deep, spaced 20cm apart.',
          'Initiate light watering frequency to stimulate sprout emergence.',
          'Verify complete seedbed coverage.'
        ],
        soil_preparation: 'Soil should remain moist, damp, and well aerated.',
        water_schedule: {
          irrigation_frequency_per_week: 3,
          irrigation_amount_liters_per_day: 20,
          irrigation_method: 'Drip lines',
          rainfall_expectation: 'Moderate rainfall expected. Adjust automated schedule.'
        },
        fertilizer_applications: [],
        pest_monitoring: ['Scout for birds eating seeds', 'Identify wireworms'],
        disease_monitoring: ['Watch for seed rot and damping-off'],
        expected_plant_height_cm: 15,
        critical_actions: ['Ensure regular soil aeration checks.'],
        weather_alerts: 'Heavy rains can wash seeds out. Check drainage channels.'
      },
      {
        month: 3,
        month_name: 'June',
        phase: 'Growth & Vigor',
        specific_tasks: [
          'Perform manual weed sweeps along secondary rows.',
          'Conduct secondary lateral nitrogen side-dress.',
          'Examine stalk rigidity indices.'
        ],
        soil_preparation: 'Keep soil loose and mulched to retain high water fractions.',
        water_schedule: {
          irrigation_frequency_per_week: 4,
          irrigation_amount_liters_per_day: 35,
          irrigation_method: 'Drip lines',
          rainfall_expectation: 'Low rainfall. Keep drip system operational.'
        },
        fertilizer_applications: [
          {
            timing: 'V6 vegetative stage',
            fertilizer_type: 'High-Nitrogen urea',
            amount_kg_per_hectare: 150,
            application_method: 'Side-dress along root lines',
            reason: 'Maximize chlorophyll production and stalk expansion.'
          }
        ],
        pest_monitoring: ['Check for Fall Armyworm feeding signs', 'Look for corn leaf aphids'],
        disease_monitoring: ['Monitor leaf rust occurrences'],
        expected_plant_height_cm: 65,
        critical_actions: ['Apply side-dress application before V8 leaf cycle.'],
        weather_alerts: 'Heat spikes predicted. Mulch roots to retain moisture.'
      },
      {
        month: 4,
        month_name: 'July',
        phase: 'Flowering & Pollination',
        specific_tasks: [
          'Check tassel development and silk emergence.',
          'Increase water volume to avoid pollination failures.',
          'Keep pathways clear for manual inspections.'
        ],
        soil_preparation: 'Maintain consistent deep moisture profiles.',
        water_schedule: {
          irrigation_frequency_per_week: 5,
          irrigation_amount_liters_per_day: 50,
          irrigation_method: 'Drip lines',
          rainfall_expectation: 'Dry and hot. Keep system at maximum pressure.'
        },
        fertilizer_applications: [
          {
            timing: 'Early silking',
            fertilizer_type: 'Potassium boost (K)',
            amount_kg_per_hectare: 80,
            application_method: 'Fertigation',
            reason: 'Support carbohydrate transport to expanding kernels.'
          }
        ],
        pest_monitoring: ['Identify Corn Earworm silk entries'],
        disease_monitoring: ['Check for smut developments'],
        expected_plant_height_cm: 150,
        critical_actions: ['Never allow the crop to wilt during silking stage.'],
        weather_alerts: 'High winds can knock stalks. Check windbreaks.'
      },
      {
        month: 5,
        month_name: 'August',
        phase: 'Maturation & Kernel Fill',
        specific_tasks: [
          'Observe kernel moisture indices.',
          'Gradually scale down irrigation volumes to dry down crops.',
          'Begin post-harvest machinery preparation.'
        ],
        soil_preparation: 'Allow the top soil layer to dry slightly.',
        water_schedule: {
          irrigation_frequency_per_week: 2,
          irrigation_amount_liters_per_day: 25,
          irrigation_method: 'Drip lines',
          rainfall_expectation: 'Dry harvest season conditions.'
        },
        fertilizer_applications: [],
        pest_monitoring: ['Check for kernel boring bugs'],
        disease_monitoring: ['Identify ear rot patterns'],
        expected_plant_height_cm: 210,
        critical_actions: ['Inspect kernel dent stage.'],
        weather_alerts: 'Late-summer storms. Ensure quick drainage runoffs.'
      },
      {
        month: 6,
        month_name: 'September',
        phase: 'Harvest & Field Recovery',
        specific_tasks: [
          'Execute mechanical harvesting when moisture hits 15%.',
          'Chop and plow back residual stalks to restore soil carbon.',
          'Sow winter cover crops (clover or rye).'
        ],
        soil_preparation: 'Plow back crop residues to fertilize next season.',
        water_schedule: {
          irrigation_frequency_per_week: 0,
          irrigation_amount_liters_per_day: 0,
          irrigation_method: 'None',
          rainfall_expectation: 'Seasonal autumn showers.'
        },
        fertilizer_applications: [],
        pest_monitoring: [],
        disease_monitoring: [],
        expected_plant_height_cm: 210,
        critical_actions: ['Harvest immediately if heavy mold or storms are predicted.'],
        weather_alerts: 'Early frost warnings. Complete harvest before October.'
      }
    ],
    harvest_guidelines: {
      readiness_indicators: [
        'Black layer formation at the base of the kernel.',
        'Husk leaves turn paper-thin, dry, and yellow.',
        'Kernel moisture falls to 15-18%.'
      ],
      recommended_harvest_date: 'Mid-September',
      expected_yield_kg: 8500,
      harvesting_method: 'Combine harvester calibrated to 15% crop speed to prevent grain crack.'
    },
    post_harvest: {
      storage_recommendations: 'Store in dry aerated silos at 13.5% moisture with active pest traps.',
      soil_recovery: 'Trench in nitrogen-rich compost and plant rye grass cover to prevent nutrient runoff.',
      next_crop: 'Soybeans (Glycine max) to biologically fixate nitrogen.'
    }
  })

  // Override defaults from pipeline if available
  useEffect(() => {
    if (planner.crop || planner.months) {
      setCalendar((prev) => ({
        ...prev,
        crop: planner.crop || prev.crop,
        planting_window_start_month: planner.planting_window_start_month || prev.planting_window_start_month,
        months: planner.months || prev.months,
        harvest_guidelines: planner.harvest_guidelines || prev.harvest_guidelines,
        post_harvest: planner.post_harvest || prev.post_harvest,
      }))
    }
  }, [planner.crop, planner.months])

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
        console.error('Error fetching calendar:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const activeMonth = calendar.months[activeMonthIdx]

  return (
    <DashboardLayout activePage="planner">
      <header className="page-header">
        <div className="page-header-left">
          <div className="results-breadcrumb">
            <a href="/dashboard">Overview</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span>Season Planner</span>
          </div>
          <h1 className="page-title">Season & Planting Planner</h1>
          <p className="page-subtitle">Interactive 6-month operational calendar specifically mapped to crop and soil data.</p>
        </div>
        <div className="page-header-right">
          <div className="season-context">
            <span className="season-label">Active Crop: {calendar.crop}</span>
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

      {/* Month Navigation Timeline Bar */}
      <div className="planner-timeline-nav">
        {calendar.months.map((m, idx) => (
          <button
            key={m.month}
            className={`timeline-month-btn ${idx === activeMonthIdx ? 'active' : ''}`}
            onClick={() => setActiveMonthIdx(idx)}
          >
            <span className="timeline-month-num">M{m.month}</span>
            <span className="timeline-month-name">{m.month_name}</span>
            <span className="timeline-month-phase">{m.phase}</span>
          </button>
        ))}
      </div>

      <div className="planner-grid">
        {/* Left Column: Active Month Operational Tasks */}
        <div className="planner-col-primary">
          <section className="card-panel active-month-card">
            <div className="month-card-header">
              <div className="month-phase-tag">{activeMonth.phase}</div>
              <h2 className="month-title">Month {activeMonth.month}: {activeMonth.month_name} Operations</h2>
            </div>

            <div className="planner-section">
              <h3>Specific Farm Tasks</h3>
              <ul className="planner-tasks-list">
                {activeMonth.specific_tasks.map((task, idx) => (
                  <li key={idx} className="planner-task-item">
                    <span className="task-bullet">{idx + 1}</span>
                    <span className="task-text">{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="planner-details-split">
              <div className="planner-split-card">
                <h4>Soil Preparation</h4>
                <p>{activeMonth.soil_preparation}</p>
              </div>
              <div className="planner-split-card">
                <h4>Irrigation Strategy</h4>
                <div className="irrigation-pill-row">
                  <span>Frequency: {activeMonth.water_schedule.irrigation_frequency_per_week}x / wk</span>
                  <span>Volume: {activeMonth.water_schedule.irrigation_amount_liters_per_day} L / day</span>
                </div>
                <p className="irrigation-meta-text">{activeMonth.water_schedule.rainfall_expectation}</p>
              </div>
            </div>

            {activeMonth.fertilizer_applications.length > 0 && (
              <div className="planner-section fertilizer-section">
                <h3>Fertilizer Applications</h3>
                {activeMonth.fertilizer_applications.map((fert, idx) => (
                  <div className="fertilizer-card-box" key={idx}>
                    <div className="fert-icon">🧪</div>
                    <div className="fert-details">
                      <span className="fert-type">{fert.fertilizer_type} ({fert.amount_kg_per_hectare} kg/ha)</span>
                      <span className="fert-method">Method: {fert.application_method} &bull; Timing: {fert.timing}</span>
                      <p className="fert-reason"><strong>Reason:</strong> {fert.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Month Warnings & Global Harvest KPIs */}
        <div className="planner-col-secondary">
          <section className="card-panel month-alerts-card">
            <h2 className="card-panel-title">Month Alert & Diagnostic</h2>
            <div className="alert-content-box warning">
              <div className="alert-icon">⚠️</div>
              <div className="alert-text-wrap">
                <span className="alert-title">Weather Precaution</span>
                <p className="alert-desc">{activeMonth.weather_alerts}</p>
              </div>
            </div>

            <div className="monitoring-panel">
              <h4>Active Monitoring Targets</h4>
              <div className="monitoring-list">
                {activeMonth.pest_monitoring.map((pest, idx) => (
                  <div className="monitoring-item pest" key={idx}>
                    <span className="monitoring-lbl">Pest Target</span>
                    <span className="monitoring-val">{pest}</span>
                  </div>
                ))}
                {activeMonth.disease_monitoring.map((disease, idx) => (
                  <div className="monitoring-item disease" key={idx}>
                    <span className="monitoring-lbl">Disease Target</span>
                    <span className="monitoring-val">{disease}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="card-panel harvest-kpi-card">
            <h2 className="card-panel-title">Harvest & Post-Harvest KPIs</h2>
            <div className="kpi-row">
              <div className="kpi-metric-box">
                <span className="kpi-lbl">Est. Yield</span>
                <span className="kpi-val">{calendar.harvest_guidelines.expected_yield_kg.toLocaleString()} kg</span>
              </div>
              <div className="kpi-metric-box">
                <span className="kpi-lbl">Harvest Window</span>
                <span className="kpi-val">{calendar.harvest_guidelines.recommended_harvest_date}</span>
              </div>
            </div>

            <div className="harvest-guidelines-box">
              <h4>Readiness Indicators</h4>
              <ul className="guidelines-bullets">
                {calendar.harvest_guidelines.readiness_indicators.map((ind, idx) => (
                  <li key={idx}>{ind}</li>
                ))}
              </ul>
            </div>

            <div className="rotation-recovery-box">
              <h4>Soil Recovery & Rotation</h4>
              <p><strong>Next Crop:</strong> {calendar.post_harvest.next_crop}</p>
              <p>{calendar.post_harvest.soil_recovery}</p>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
