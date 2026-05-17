const checklist = [
  'Photo, text, or voice soil input',
  'Real-time crop recommendations',
  'Full pest & disease management plan',
]

export default function WhyCropSense() {
  return (
    <section className="why-section">
      <div className="container">
        <div className="why-image">
          <img
            src="/img2.png"
            alt="Farmer in field"
          />
        </div>

        <div className="why-text">
          <h2 className="why-heading">
            Sophisticated insights, simple enough for the field.
          </h2>

          <p className="why-body">
            We don't just provide charts. We provide answers. Our mobile-first interface ensures that you have the full power of precision agriculture right in the palm of your hand, whether you're in the office or on a tractor.
          </p>

          <div className="why-checklist">
            {checklist.map((item, i) => (
              <div className="checklist-item" key={i}>
                <div className="checkmark">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
