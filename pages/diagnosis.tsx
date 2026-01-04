import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, MapPinIcon, HeartIcon, ClockIcon, CameraIcon, BoltIcon, CheckIcon, DocumentTextIcon, ArrowDownTrayIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FeedbackForm from '@/components/FeedbackForm'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'

interface Hospital {
  id: number
  name: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  specialty: string
  distance?: number
}

interface PredictionResult {
  predicted_class: string
  confidence: number
  top_predictions: Record<string, number>
  is_mri: boolean
  error?: string
  message?: string
}

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  
  // MRI Upload and Prediction states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Report generation loading states
  const [generatingViewReport, setGeneratingViewReport] = useState(false)
  const [generatingDownloadReport, setGeneratingDownloadReport] = useState(false)
  
  // Language selection modal state
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi'>('english')
  const [pendingReportAction, setPendingReportAction] = useState<'view' | 'download' | null>(null)
  
  // Feedback form state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => console.log('Geolocation error:', error)
      )
    }
  }, [])

  const searchHospitals = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/hospitals/search', {
        params: {
          name: searchTerm,
          location: location,
          specialty: specialty,
          lat: userLocation?.lat,
          lng: userLocation?.lng
        }
      })
      setHospitals(response.data.slice(0, 6))
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  // MRI Upload Functions
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        setSelectedFile(file)
        setPredictionResult(null)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith('image/')) {
        setSelectedFile(file)
        setPredictionResult(null)
      }
    }
  }

  const predictDisease = async () => {
    if (!selectedFile) return

    setPredicting(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await axios.post('http://localhost:8000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setPredictionResult(response.data)
    } catch (error) {
      console.error('Prediction error:', error)
      setPredictionResult({
        predicted_class: '',
        confidence: 0,
        top_predictions: {},
        is_mri: false,
        error: 'Failed to connect to prediction service. Make sure the Python FastAPI server is running on port 8000.'
      })
    } finally {
      setPredicting(false)
    }
  }

  const handleViewDetailedReport = () => {
    if (!isAuthenticated()) {
      // Store the action they wanted to perform
      localStorage.setItem('pendingAction', 'view-report')
      localStorage.setItem('predictionData', JSON.stringify(predictionResult))
      // Redirect to login with message
      router.push('/login?message=' + encodeURIComponent('Please login to view detailed report'))
      return
    }

    // Show language selection modal
    setPendingReportAction('view')
    setShowLanguageModal(true)
  }

  const handleDownloadReport = () => {
    if (!isAuthenticated()) {
      // Store the action they wanted to perform
      localStorage.setItem('pendingAction', 'download-report')
      localStorage.setItem('predictionData', JSON.stringify(predictionResult))
      // Redirect to login with message
      router.push('/login?message=' + encodeURIComponent('Please login to download report'))
      return
    }

    // Show language selection modal
    setPendingReportAction('download')
    setShowLanguageModal(true)
  }

  const generateReportWithLanguage = async () => {
    if (!pendingReportAction) return
    
    // Double-check authentication before proceeding
    if (!isAuthenticated()) {
      setShowLanguageModal(false)
      setPendingReportAction(null)
      alert('Your session has expired. Please login again.')
      router.push('/login?message=' + encodeURIComponent('Session expired. Please login again.'))
      return
    }
    
    setShowLanguageModal(false)
    
    const isViewMode = pendingReportAction === 'view'
    if (isViewMode) {
      setGeneratingViewReport(true)
    } else {
      setGeneratingDownloadReport(true)
    }

    try {
      // Convert selected file to base64 if available
      let imageData = null
      if (selectedFile) {
        imageData = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(selectedFile)
        })
      }

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication token not found. Please login again.')
      }

      // Log the selected language for debugging
      console.log('🌐 Generating report in language:', selectedLanguage)
      console.log('🔑 Using token:', token.substring(0, 20) + '...')
      console.log('📍 Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001')

      const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          prediction: predictionResult, 
          mode: pendingReportAction,
          imageData: imageData,
          language: selectedLanguage
        })
      })
      
      console.log('📡 Response status:', resp.status)
      
      if (!resp.ok) {
        const err = await resp.json()
        console.error('❌ Server error:', err)
        
        // Handle authentication errors specifically
        if (resp.status === 401 || resp.status === 403) {
          localStorage.removeItem('token')
          throw new Error('Your session has expired. Please login again.')
        }
        
        throw new Error(err.error || 'Report generation failed')
      }
      
      const data = await resp.json()
      
      if (isViewMode) {
        // Open the viewer page in a new tab
        window.open(data.viewUrl, '_blank')
      } else {
        // Download the PDF directly without redirecting
        const pdfUrl = data.downloadUrl
        
        // Fetch the PDF as a blob to ensure download works properly
        const pdfResponse = await fetch(pdfUrl)
        const pdfBlob = await pdfResponse.blob()
        const blobUrl = window.URL.createObjectURL(pdfBlob)
        
        // Create download link and trigger download
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `ArogyaPath-Report-${predictionResult?.predicted_class?.replace(/_/g, '-') || 'scan'}-${Date.now()}.pdf`
        document.body.appendChild(link)
        link.click()
        
        // Cleanup
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      }
    } catch (err: any) {
      console.error('Failed to generate report:', err)
      
      // Check if it's a network error
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        alert('Cannot connect to backend server. Please ensure:\n' +
              '1. Backend server is running on port 3001\n' +
              '2. Run: node backend/server.js')
        return
      }
      
      // Check if it's an authentication error
      if (err.message && err.message.includes('token')) {
        alert('Your session has expired. Please login again.')
        localStorage.removeItem('token')
        router.push('/login?message=' + encodeURIComponent('Session expired. Please login again.'))
      } else {
        alert('Failed to generate report: ' + (err.message || err))
      }
    } finally {
      if (isViewMode) {
        setGeneratingViewReport(false)
      } else {
        setGeneratingDownloadReport(false)
      }
      setPendingReportAction(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <Head>
        <title>AI Brain MRI Diagnosis - आरोग्यPath</title>
        <meta name="description" content="Upload your brain MRI scan for instant AI-powered analysis with 99.98% accuracy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden py-12 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto">
            
            {/* Main Heading */}
            <motion.div
              className="text-center mb-12"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="inline-block px-4 py-2 bg-cyan-500/20 rounded-full mb-6 border border-cyan-500/30">
                <span className="text-cyan-400 font-semibold text-sm">🧠 AI-Powered MRI Analysis</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                Brain MRI <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Diagnosis</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
                Upload your brain MRI scan and receive instant AI-powered analysis with 99.98% accuracy.
                Get comprehensive reports in English or Hindi with personalized recommendations.
              </p>
            </motion.div>

            {/* Main Content - Centered */}
            <div className="flex justify-center mt-12">
              
              {/* MRI Upload Section - Centered */}
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <BoltIcon className="w-8 h-8 text-cyan-500 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900">Upload MRI Image</h2>
                  </div>

                  {/* File Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer ${
                      dragActive 
                        ? 'border-cyan-500 bg-cyan-50' 
                        : 'border-gray-300 hover:border-cyan-400 bg-gray-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                    
                    {selectedFile ? (
                      <div className="space-y-4">
                        <CheckIcon className="w-12 h-12 mx-auto text-green-500" />
                        <p className="text-gray-900 font-medium">{selectedFile.name}</p>
                        <p className="text-gray-600 text-sm">Click to change file</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <CameraIcon className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="text-gray-700 font-medium">
                          {dragActive ? 'Drop your MRI image here' : 'No file chosen'}
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-gray-600">
                          <CameraIcon className="w-4 h-4" />
                          <span>Choose from device or drag & drop</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Predict Button */}
                  <motion.button
                    onClick={predictDisease}
                    disabled={!selectedFile || predicting}
                    className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: selectedFile && !predicting ? 1.02 : 1 }}
                    whileTap={{ scale: selectedFile && !predicting ? 0.98 : 1 }}
                  >
                    {predicting ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                        Analyzing MRI...
                      </>
                    ) : (
                      <>
                        <BoltIcon className="w-6 h-6" />
                        Analyze MRI Scan
                      </>
                    )}
                  </motion.button>

                  {/* Prediction Results */}
                  {predictionResult && (
                    <motion.div
                      className="mt-6 p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {predictionResult.error ? (
                        <div className="text-red-600">
                          <p className="font-semibold">Error:</p>
                          <p className="text-sm">{predictionResult.error}</p>
                          {predictionResult.message && (
                            <p className="text-sm mt-1">{predictionResult.message}</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-900">
                          <div className="flex items-center gap-2 mb-4">
                            <CheckIcon className="w-6 h-6 text-green-600" />
                            <p className="font-bold text-xl text-gray-900">Analysis Complete</p>
                          </div>
                          <div className="space-y-3 bg-white rounded-lg p-4 border border-cyan-200">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Predicted Condition:</p>
                              <p className="text-xl font-bold text-cyan-600">{predictionResult.predicted_class.replace(/_/g, ' ')}</p>
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                              <p className="text-sm text-gray-600 mb-1">Certainty Score:</p>
                              <p className="text-2xl font-bold text-green-600">{predictionResult.confidence.toFixed(2)}%</p>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <motion.button
                              onClick={handleViewDetailedReport}
                              disabled={generatingViewReport || generatingDownloadReport}
                              className={`flex-1 ${
                                generatingViewReport || generatingDownloadReport
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700'
                              } text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
                              whileHover={generatingViewReport || generatingDownloadReport ? {} : { scale: 1.02 }}
                              whileTap={generatingViewReport || generatingDownloadReport ? {} : { scale: 0.98 }}
                            >
                              {generatingViewReport ? (
                                <>
                                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Generating Report...
                                </>
                              ) : (
                                <>
                                  <DocumentTextIcon className="w-5 h-5" />
                                  View Detailed Report
                                </>
                              )}
                            </motion.button>
                            
                            <motion.button
                              onClick={handleDownloadReport}
                              disabled={generatingViewReport || generatingDownloadReport}
                              className={`flex-1 ${
                                generatingViewReport || generatingDownloadReport
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700'
                              } text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
                              whileHover={generatingViewReport || generatingDownloadReport ? {} : { scale: 1.02 }}
                              whileTap={generatingViewReport || generatingDownloadReport ? {} : { scale: 0.98 }}
                            >
                              {generatingDownloadReport ? (
                                <>
                                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <ArrowDownTrayIcon className="w-5 h-5" />
                                  Download Report
                                </>
                              )}
                            </motion.button>
                          </div>
                          
                          {!isAuthenticated() && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-amber-800 text-sm text-center">
                                <span className="font-medium">💡 Note:</span> Login required to access detailed reports and download functionality
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </motion.section>

        {/* Results Section */}
        {hospitals.length > 0 && (
          <section className="px-4">
            <div className="max-w-7xl mx-auto">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12 gradient-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Found {hospitals.length} Hospitals
              </motion.h2>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {hospitals.map((hospital, index) => (
                  <motion.div
                    key={hospital.id}
                    className="hospital-card"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-200 flex-1">
                        {hospital.name}
                      </h3>
                      {hospital.distance && (
                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full ml-2">
                          {hospital.distance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3 text-gray-400">
                      <div className="flex items-start">
                        <MapPinIcon className="w-5 h-5 mt-0.5 mr-2 text-gray-400 flex-shrink-0" />
                        <p className="text-sm">{hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}</p>
                      </div>
                      
                      {hospital.phone && (
                        <div className="flex items-center">
                          <ClockIcon className="w-5 h-5 mr-2 text-gray-400" />
                          <p className="text-sm">{hospital.phone}</p>
                        </div>
                      )}
                      
                      {hospital.specialty && (
                        <div className="flex items-center">
                          <HeartIcon className="w-5 h-5 mr-2 text-gray-400" />
                          <p className="text-sm font-medium text-cyan-400">{hospital.specialty}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 flex space-x-3">
                      <button className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-colors text-sm font-medium">
                        View Details
                      </button>
                      <button className="flex-1 border-2 border-cyan-500 text-cyan-400 py-2 px-4 rounded-lg hover:bg-cyan-500/10 transition-colors text-sm font-medium">
                        Get Directions
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}
      
      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
          >
            <h2 className="text-2xl font-bold text-gray-200 mb-4 text-center">
              Select Report Language
            </h2>
            <p className="text-gray-400 mb-6 text-center">
              Choose the language for your medical report
            </p>
            
            <div className="space-y-3 mb-6">
              {/* English Option */}
              <button
                onClick={() => setSelectedLanguage('english')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                  selectedLanguage === 'english'
                    ? 'border-cyan-500 bg-cyan-50 shadow-md'
                    : 'border-cyan-500/30 hover:border-cyan-400 hover:bg-gray-800'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedLanguage === 'english' ? 'border-cyan-500' : 'border-cyan-500/30'
                }`}>
                  {selectedLanguage === 'english' && (
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-semibold ${selectedLanguage === 'english' ? 'text-gray-900' : 'text-gray-200'}`}>English</div>
                  <div className="text-sm text-gray-500">Medical report in English</div>
                </div>
                <div className="text-2xl">🇬🇧</div>
              </button>
              
              {/* Hindi Option */}
              <button
                onClick={() => setSelectedLanguage('hindi')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                  selectedLanguage === 'hindi'
                    ? 'border-cyan-500 bg-cyan-50 shadow-md'
                    : 'border-cyan-500/30 hover:border-cyan-400 hover:bg-gray-800'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedLanguage === 'hindi' ? 'border-cyan-500' : 'border-cyan-500/30'
                }`}>
                  {selectedLanguage === 'hindi' && (
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-200">हिंदी (Hindi)</div>
                  <div className="text-sm text-gray-500">चिकित्सा रिपोर्ट हिंदी में</div>
                </div>
                <div className="text-2xl">🇮🇳</div>
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLanguageModal(false)
                  setPendingReportAction(null)
                }}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-cyan-500/30 text-gray-300 font-semibold hover:bg-gray-800 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={generateReportWithLanguage}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-semibold hover:from-cyan-600 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Generate Report
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Feedback Form Modal */}
      <FeedbackForm 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />

      {/* Floating Feedback Button */}
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 group"
      >
        <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Share Feedback
        </span>
      </button>
    </div>
  )
}