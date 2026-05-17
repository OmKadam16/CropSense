import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-left">
          <span className="hero-badge">NURTURING DATA SCIENCE</span>

          <h1 className="hero-heading">
            Listen to Your{' '}
            <span className="italic-green">Soil</span>
          </h1>

          <p className="hero-subtext">
            Bridge the gap between traditional agricultural heritage and sophisticated data science. Cultivate deeper insights with our nature-forward precision growth platform.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/analysis')}>Start Free Trial</button>
            <button className="btn-secondary" onClick={() => navigate('/analysis')}>
              See How it Works
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">12k+</span>
              <span className="stat-label">Active Growers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">98%</span>
              <span className="stat-label">Yield Accuracy</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-image-wrapper">
            <img
              className="hero-image"
              src="/img1.png"
              alt="Soil analysis"
            />
            <div className="floating-card">
              <div className="floating-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="12" width="4" height="9" />
                  <rect x="10" y="7" width="4" height="14" />
                  <rect x="17" y="3" width="4" height="18" />
                </svg>
              </div>
              <div className="floating-card-content">
                <span className="floating-card-label">Soil Moisture</span>
                <span className="floating-card-value">74.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
