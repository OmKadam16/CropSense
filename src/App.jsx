import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Analysis from './pages/Analysis'
import Analyze from './pages/Analyze'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Results from './pages/Results'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import TextureAnalysis from './pages/TextureAnalysis'
import NutrientAnalysis from './pages/NutrientAnalysis'
import CropRecommendation from './pages/CropRecommendation'
import SeasonPlanner from './pages/SeasonPlanner'
import PestManagement from './pages/PestManagement'
import Footer from './components/Footer'
import { AnalysisProvider } from './lib/AnalysisContext'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnalysisProvider>
        <Routes>
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/results" element={<Results />} />
          <Route path="/results/texture" element={<TextureAnalysis />} />
          <Route path="/results/nutrients" element={<NutrientAnalysis />} />
          <Route path="/results/crops" element={<CropRecommendation />} />
          <Route path="/results/planner" element={<SeasonPlanner />} />
          <Route path="/results/pest" element={<PestManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </AnalysisProvider>
    </BrowserRouter>
  )
}
