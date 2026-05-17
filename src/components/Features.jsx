const features = [
  {
    icon: 'scan',
    title: 'Instant Soil Analysis',
    desc: 'Upload a photo, type a description, or record a voice note. Our AI analyzes texture, nutrients, pH, and moisture in seconds.',
  },
  {
    icon: 'crop',
    title: 'Smart Crop Recommendations',
    desc: 'Get the top 5 crops best suited to your soil type, climate zone, and local conditions. Maximize every planting decision.',
  },
  {
    icon: 'calendar',
    title: '6-Month Planting Calendar',
    desc: 'Receive a detailed month-by-month schedule with tasks, water schedules, fertilizer timing, and harvest dates tailored to your soil.',
  },
  {
    icon: 'pest',
    title: 'Pest & Disease Management',
    desc: 'Identify high-risk pests and diseases for your specific crop. Get prevention strategies, organic controls, and IPM calendars.',
  },
  {
    icon: 'report',
    title: 'Detailed Soil Health Reports',
    desc: 'Comprehensive reports on soil composition, strengths, limitations, and immediate action items. Track your farm\'s health over time.',
  },
  {
    icon: 'farm',
    title: 'Farm Profile Management',
    desc: 'Set up your farm profile, track multiple analyses, and get personalized recommendations based on your unique climate and history.',
  },
]

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="features-header">
        <h2 className="features-heading">
          Precision growth, nurtured by data and grounded in tradition.
        </h2>
        <div className="features-underline" />
      </div>

      <div className="features-grid">
        {features.map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-card-icon">
              {f.icon === 'scan' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="1" />
                </svg>
              )}
              {f.icon === 'crop' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 22h20" /><path d="M12 2v20" /><path d="M8 6h8" /><path d="M8 10h8" /><path d="M8 14h8" />
                </svg>
              )}
              {f.icon === 'calendar' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              )}
              {f.icon === 'pest' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              )}
              {f.icon === 'report' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" />
                </svg>
              )}
              {f.icon === 'farm' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              )}
            </div>
            <h3 className="feature-card-title">{f.title}</h3>
            <p className="feature-card-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
