const values = [
  {
    title: 'Sustainable',
    text: 'Environmentally responsible farming practices',
  },
  {
    title: 'Data-Driven',
    text: 'Every recommendation backed by science',
  },
  {
    title: 'Farmer-First',
    text: 'Designed for simplicity and accessibility',
  },
]

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about-text">
          <span className="about-label">OUR MISSION</span>

          <h2 className="about-heading">About CropSense</h2>

          <p className="about-body">
            CropSense bridges the gap between traditional agricultural heritage and sophisticated data science. We believe every farmer—regardless of farm size or location—deserves access to precision agriculture tools.
          </p>

          <p className="about-body">
            Our mission is simple: empower farmers with real-time soil insights and actionable recommendations so they can maximize yield, reduce costs, and build sustainable farming practices for generations.
          </p>

          <div className="values-list">
            {values.map((v, i) => (
              <div className="value-item" key={i}>
                <div>
                  <div className="value-title">{v.title}</div>
                  <div className="value-text">{v.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=700"
            alt="Farming community"
          />
        </div>
      </div>
    </section>
  )
}
