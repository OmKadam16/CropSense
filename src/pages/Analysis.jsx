import { useState, useRef, useCallback, useEffect } from 'react'
import Navbar from '../components/Navbar'
import './Analysis.css'

const outputCards = [
  {
    icon: 'composition',
    label: 'Soil Composition',
    preview: 'Discover your soil texture — sand, silt, and clay distribution',
    value: 'Sandy Loam — 72% Sand, 18% Silt, 10% Clay',
  },
  {
    icon: 'ph',
    label: 'pH Level',
    preview: 'Know your soil acidity and whether it is optimal for planting',
    value: '6.8 — Slightly acidic, ideal for most crops',
  },
  {
    icon: 'nutrient',
    label: 'Nutrient Profile (N-P-K)',
    preview: 'Nitrogen, Phosphorus, and Potassium levels in your soil',
    value: 'Nitrogen: 24 ppm | Phosphorus: 18 ppm | Potassium: 210 ppm',
  },
  {
    icon: 'moisture',
    label: 'Moisture Content',
    preview: 'Current hydration levels and irrigation recommendations',
    value: '74.2% — Adequate for planting',
  },
  {
    icon: 'crops',
    label: 'Recommended Crops',
    preview: 'Top crop varieties best suited to your soil conditions',
    value: 'Wheat, Barley, Corn, Sunflower, Soybean',
  },
  {
    icon: 'pest',
    label: 'Pest Risk Assessment',
    preview: 'Identify pest risks and get prevention strategies',
    value: 'Low risk — Standard preventive measures recommended',
  },
]

const iconSvgs = {
  composition: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  ph: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ),
  nutrient: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  moisture: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  crops: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22h20" /><path d="M12 2v20" /><path d="M8 6h8" />
    </svg>
  ),
  pest: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
}

export default function Analysis() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImage(file)
    setAnalyzed(false)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  const handleAnalyze = () => {
    if (!image) return
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setAnalyzed(true)
    }, 2000)
  }

  const handleReset = () => {
    setImage(null)
    setPreview(null)
    setAnalyzing(false)
    setAnalyzed(false)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Navbar />
      <section className="analysis-page">
        <div className="analysis-container">
          <div className="analysis-header">
            <span className="analysis-badge">SOIL ANALYSIS</span>
            <h1 className="analysis-heading">Analyze Your Soil</h1>
            <p className="analysis-subtext">
              Upload a photo of your soil and let our AI analyze its composition, nutrients, and health in seconds.
            </p>
          </div>

          <div
            ref={dropRef}
            className={`drop-zone${preview ? ' has-image' : ''}${analyzing ? ' analyzing' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={!preview ? handleClick : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              hidden
            />

            {!preview && (
              <div className="drop-content">
                <div className="drop-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="drop-text">Drag & drop your soil image here</p>
                <p className="drop-subtext">or click to browse from your device</p>
                <span className="drop-formats">Supports JPG, PNG, WEBP</span>
              </div>
            )}

            {preview && !analyzing && (
              <div className="preview-wrapper">
                <img src={preview} alt="Soil sample" className="preview-image" />
                <div className="preview-actions">
                  <button className="btn-change" onClick={(e) => { e.stopPropagation(); handleReset() }}>
                    Change Image
                  </button>
                  <button className="btn-analyze" onClick={(e) => { e.stopPropagation(); handleAnalyze() }}>
                    Analyze Soil
                  </button>
                </div>
              </div>
            )}

            {analyzing && (
              <div className="analyzing-overlay">
                <div className="spinner" />
                <p className="analyzing-text">Analyzing your soil...</p>
                <p className="analyzing-sub">This will take just a moment</p>
              </div>
            )}
          </div>

          <div className="results-section">
            <div className="results-header">
              <h2 className="results-heading">{analyzed ? 'Your Analysis Results' : 'What You\'ll Discover'}</h2>
              {analyzed && <span className="results-status">Results Ready</span>}
              <div className="results-underline" />
            </div>

            <div className="results-grid">
              {outputCards.map((r, i) => (
                <div className={`result-card${analyzed ? ' populated' : ''}`} key={i}>
                  <div className="result-icon">
                    {iconSvgs[r.icon]}
                  </div>
                  <div className="result-content">
                    <span className="result-label">{r.label}</span>
                    <span className={`result-value${analyzed ? ' done' : ''}`}>
                      {analyzed ? r.value : r.preview}
                    </span>
                    {!analyzed && <span className="result-awaiting">Awaiting analysis</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="results-actions">
              <button className="btn-new-analysis" onClick={handleReset}>
                {analyzed ? 'Analyze Another Sample' : 'Upload Your Soil Photo'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
