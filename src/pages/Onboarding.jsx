import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileSpreadsheet, FileImage, X, ChevronRight, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'
import { useAnalysis } from '../lib/AnalysisContext'
import { runAnalysis, disconnectPipeline } from '../lib/rocketride'
import './Onboarding.css'

const ACCEPTED = ['.csv', '.xlsx', '.png', '.jpg', '.jpeg']
const ACCEPT_STRING = '.csv,.xlsx,.png,.jpg,.jpeg'

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['csv', 'xlsx'].includes(ext)) return <FileSpreadsheet size={20} />
  return <FileImage size={20} />
}

export default function Onboarding() {
  const [userName, setUserName] = useState(() => localStorage.getItem('username') || '')
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { setPipelineResult, setUserFarm } = useAnalysis()

  useEffect(() => {
    window.scrollTo(0, 0)
    async function loadUser() {
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
      } catch {}
    }
    loadUser()
  }, [])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    const valid = dropped.filter((f) =>
      ACCEPTED.includes('.' + f.name.split('.').pop().toLowerCase())
    )
    setFiles((prev) => [...prev, ...valid])
  }, [])

  const handleInputChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles((prev) => [...prev, ...selected])
    e.target.value = ''
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0 || isRunning) return
    setIsRunning(true)
    setError('')
    setStatusMsg('Connecting to analysis pipeline...')

    let userCropType = ''
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: cultivation } = await supabase
          .from('cultivation_profiles')
          .select('crop_type')
          .eq('user_id', user.id)
          .single()
        userCropType = cultivation?.crop_type || ''
        const { data: farm } = await supabase
          .from('farm_params')
          .select('city')
          .eq('user_id', user.id)
          .single()
        setUserFarm({ city: farm?.city || '', cropType: userCropType })
      }
    } catch {}

    try {
      setStatusMsg('Running multi-agent analysis on RocketRide...')
      const result = await runAnalysis(files, userCropType)
      setPipelineResult(result)
      await disconnectPipeline()
      navigate('/dashboard')
    } catch (err) {
      console.error('Analysis failed:', err)
      setStatusMsg('')
      setError(err.message || 'Analysis failed. Please try again.')
      await disconnectPipeline().catch(() => {})
      setIsRunning(false)
    }
  }, [files, isRunning, setPipelineResult, setUserFarm, navigate])

  const firstName = userName.split(' ')[0]

  return (
    <div className="onboarding-page">
      <Navbar />
      <div className="onboarding-container">
        <div className="onboarding-hero">
          <div className="onboarding-badge">First-Time Setup</div>
          <h1 className="onboarding-heading">Welcome to CropSense, {firstName}</h1>
          <p className="onboarding-subtext">
            Let&rsquo;s analyze your first soil sample to build a personalized dashboard. 
            Drag and drop your soil images or data files below.
          </p>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="onboarding-upload-card"
        >
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isRunning && inputRef.current?.click()}
            className={`onboarding-drop-zone ${isDragging ? 'dragging' : ''} ${isRunning ? 'disabled' : ''} ${files.length > 0 ? 'has-files' : ''}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_STRING}
              multiple
              onChange={handleInputChange}
              className="hidden"
              disabled={isRunning}
            />

            {isRunning ? (
              <div className="analyzing-overlay">
                <div className="spinner" />
                <p className="analyzing-text">Analyzing Your Soil</p>
                {statusMsg && <p className="analyzing-sub">{statusMsg}</p>}
              </div>
            ) : files.length === 0 ? (
              <motion.div
                animate={isDragging ? { scale: 1.05, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="drop-content"
              >
                <div className="drop-icon">
                  <Upload size={28} />
                </div>
                <p className="drop-text">Drop your soil files here</p>
                <p className="drop-subtext">or click to browse</p>
                <p className="drop-formats">CSV, XLSX, PNG, JPG &bull; Max 50 MB per file</p>
              </motion.div>
            ) : (
              <div className="drop-content">
                <div className="drop-icon">
                  <Upload size={28} />
                </div>
                <p className="drop-text">{files.length} file{files.length !== 1 ? 's' : ''} selected</p>
                <p className="drop-subtext">{formatSize(totalSize)} total &bull; Click or drag to add more</p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {files.length > 0 && !isRunning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }}
                className="onboarding-file-list"
              >
                <div className="file-list-inner">
                  {files.map((file, i) => (
                    <motion.div
                      key={file.name + file.size + i}
                      layout
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: i * 0.05 }}
                      className="file-preview-card"
                    >
                      <div className="file-preview-icon">
                        {getFileIcon(file.name)}
                      </div>
                      <div className="file-preview-info">
                        <p className="file-preview-name">{file.name}</p>
                        <p className="file-preview-size">{formatSize(file.size)}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                        className="file-remove-btn"
                      >
                        <X size={16} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleAnalyze}
                  className="onboarding-analyze-btn"
                >
                  Analyze {files.length} file{files.length !== 1 ? 's' : ''}
                  <ChevronRight size={18} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="onboarding-error"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
              <button onClick={() => { setError(''); setIsRunning(false) }} className="onboarding-retry-btn">
                Try Again
              </button>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
