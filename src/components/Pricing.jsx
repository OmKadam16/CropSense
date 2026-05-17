const freeFeatures = [
  'Unlimited soil analyses',
  'Photo, text & voice input',
  'Top 5 crop recommendations',
  '6-month planting calendar',
  'Pest & disease management',
  'Detailed soil health reports',
  'Mobile & desktop access',
]

export default function Pricing() {
  return (
    <section className="pricing" id="pricing">
      <div className="pricing-header">
        <h2 className="pricing-heading">Simple, Transparent Pricing</h2>
        <p className="pricing-subtext">Start free. No credit card required.</p>
      </div>

      <div className="pricing-cards">
        <div className="pricing-card free">
          <h3 className="card-title">Free</h3>
          <div className="card-price-row">
            <span className="card-price">$0</span>
            <span className="card-period">/month</span>
          </div>
          <p className="card-subtitle">Everything you need to get started</p>

          <ul className="feature-list">
            {freeFeatures.map((f, i) => (
              <li key={i}>
                <span className="feature-check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>

          <button className="card-cta free-cta">Get Started Free</button>
        </div>
      </div>
    </section>
  )
}
