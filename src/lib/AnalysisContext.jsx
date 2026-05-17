import { createContext, useContext, useState, useCallback } from 'react'

const AnalysisContext = createContext(null)

export function AnalysisProvider({ children }) {
  const [pipelineResult, setPipelineResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisError, setAnalysisError] = useState(null)
  const [userFarm, setUserFarm] = useState(null)

  const clearAnalysis = useCallback(() => {
    setPipelineResult(null)
    setAnalysisProgress(0)
    setAnalysisError(null)
  }, [])

  return (
    <AnalysisContext.Provider
      value={{
        pipelineResult,
        setPipelineResult,
        isAnalyzing,
        setIsAnalyzing,
        analysisProgress,
        setAnalysisProgress,
        analysisError,
        setAnalysisError,
        userFarm,
        setUserFarm,
        clearAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider')
  return ctx
}
