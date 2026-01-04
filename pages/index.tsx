import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Building2, 
  MapPin, 
  Shield, 
  Zap, 
  Users,
  ArrowRight,
  CheckCircle,
  Activity,
  Heart,
  Search,
  FileText
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import FeedbackForm from '@/components/FeedbackForm'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Powered MRI Analysis',
      description: 'Advanced deep learning model analyzes MRI scans with 99.98% accuracy to detect brain abnormalities',
      color: 'from-cyan-500 to-cyan-400'
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: 'Comprehensive Hospital Database',
      description: '32,000+ hospitals including government and Ayushman Bharat empanelled facilities across India',
      color: 'from-cyan-400 to-cyan-500'
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Location-Based Search',
      description: 'Find nearby hospitals with real-time distance calculation and detailed facility information',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Bilingual Reports',
      description: 'Generate detailed medical reports in English or Hindi with AI-powered explanations',
      color: 'from-cyan-400 to-cyan-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and stored securely with JWT authentication',
      color: 'from-cyan-600 to-cyan-400'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Instant Results',
      description: 'Get MRI analysis results in seconds with downloadable PDF reports',
      color: 'from-cyan-500 to-cyan-400'
    }
  ]

  const stats = [
    { label: 'Model Accuracy', value: '99.98%', icon: <Activity className="w-6 h-6" /> },
    { label: 'Hospitals Registered', value: '32,208', icon: <Building2 className="w-6 h-6" /> }
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'Upload MRI Scan',
      description: 'Upload your brain MRI image in common formats (JPG, PNG, DICOM)',
      icon: <Brain className="w-6 h-6" />
    },
    {
      step: '2',
      title: 'AI Analysis',
      description: 'Our DenseNet201 model analyzes the scan for abnormalities in seconds',
      icon: <Zap className="w-6 h-6" />
    },
    {
      step: '3',
      title: 'Get Report',
      description: 'Receive detailed analysis with recommendations in your preferred language',
      icon: <FileText className="w-6 h-6" />
    },
    {
      step: '4',
      title: 'Find Hospital',
      description: 'Locate nearby specialized hospitals for consultation and treatment',
      icon: <Building2 className="w-6 h-6" />
    }
  ]

  return (
    <>
            <Head>
        <title>आरोग्यPath - AI-Powered Healthcare Platform | Brain MRI Analysis</title>
        <meta name="description" content="Get instant AI-powered brain MRI diagnosis with 99.98% accuracy. Find nearby hospitals from India's largest database of 32,000+ facilities including PMJAY centers." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Welcome Message */}
                <div className="mb-8">
                  <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                    <span className="text-white">स्वागत है </span>
                    <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">आरोग्य</span>
                    <span className="text-white"> Path </span>
                    <span className="text-gray-400">में,</span>
                  </h1>
                </div>
                
                <div className="inline-block px-4 py-2 bg-cyan-500/20 border border-cyan-500 rounded-full mb-8">
                  <span className="text-cyan-400 font-semibold text-sm">🏥 AI-Powered Healthcare Platform</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight text-white">
                  Get Your <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Second Opinion</span> Here!!
                </h2>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Discover government and private hospitals in your area with our comprehensive healthcare finder. 
                  Get instant access to AI-powered MRI analysis, hospital information, locations, and services.
                </p>

                <div className="bg-cyan-500/10 border-l-4 border-cyan-500 p-4 mb-8 rounded-r-lg">
                  <p className="text-green-800 font-semibold">
                    ✨ Now with Ayushman Bharat hospital support!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/diagnosis">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-cyan-600 text-black px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all flex items-center justify-center gap-2"
                    >
                      <Brain className="w-6 h-6" />
                      Try AI Diagnosis
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                  
                  <Link href="/hospitals">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto bg-gray-900 border-2 border-cyan-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="w-6 h-6" />
                      Find Hospitals
                    </motion.button>
                  </Link>
                </div>
              </motion.div>

              {/* Right Content - Sample Report Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                  {/* Sample Report Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">MRI Analysis Report</h3>
                      <span className="text-xs text-gray-500">Sample</span>
                    </div>
                    
                    {/* MRI Image Placeholder */}
                    <div className="aspect-square bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                      {/* Simulated MRI Scan Image */}
                      <svg viewBox="0 0 400 400" className="w-full h-full">
                        {/* Black background */}
                        <rect width="400" height="400" fill="#000000"/>
                        
                        {/* Outer skull circle */}
                        <ellipse cx="200" cy="200" rx="140" ry="160" fill="none" stroke="#666" strokeWidth="2"/>
                        
                        {/* Brain tissue - gray matter */}
                        <ellipse cx="200" cy="200" rx="130" ry="150" fill="#2a2a2a"/>
                        
                        {/* Brain hemispheres separation */}
                        <line x1="200" y1="60" x2="200" y2="340" stroke="#1a1a1a" strokeWidth="3"/>
                        
                        {/* Left hemisphere details */}
                        <ellipse cx="150" cy="180" rx="50" ry="70" fill="#3a3a3a" opacity="0.7"/>
                        <ellipse cx="140" cy="220" rx="45" ry="60" fill="#4a4a4a" opacity="0.6"/>
                        
                        {/* Right hemisphere details */}
                        <ellipse cx="250" cy="180" rx="50" ry="70" fill="#3a3a3a" opacity="0.7"/>
                        <ellipse cx="260" cy="220" rx="45" ry="60" fill="#4a4a4a" opacity="0.6"/>
                        
                        {/* Ventricles (darker areas) */}
                        <ellipse cx="180" cy="200" rx="15" ry="25" fill="#1a1a1a"/>
                        <ellipse cx="220" cy="200" rx="15" ry="25" fill="#1a1a1a"/>
                        
                        {/* Brain texture lines */}
                        <path d="M 120 150 Q 150 160 180 155" stroke="#555" strokeWidth="1.5" fill="none"/>
                        <path d="M 220 155 Q 250 160 280 150" stroke="#555" strokeWidth="1.5" fill="none"/>
                        <path d="M 130 200 Q 160 210 185 205" stroke="#555" strokeWidth="1.5" fill="none"/>
                        <path d="M 215 205 Q 240 210 270 200" stroke="#555" strokeWidth="1.5" fill="none"/>
                        
                        {/* Crosshair markers */}
                        <line x1="20" y1="200" x2="35" y2="200" stroke="#888" strokeWidth="1"/>
                        <line x1="365" y1="200" x2="380" y2="200" stroke="#888" strokeWidth="1"/>
                        <line x1="200" y1="20" x2="200" y2="35" stroke="#888" strokeWidth="1"/>
                        <line x1="200" y1="365" x2="200" y2="380" stroke="#888" strokeWidth="1"/>
                      </svg>
                      
                      {/* MRI scan label */}
                      <div className="absolute bottom-2 left-2 text-white text-xs font-mono bg-black/70 px-2 py-1 rounded">
                        AXIAL T1
                      </div>
                      <div className="absolute top-2 right-2 text-white text-xs font-mono bg-black/70 px-2 py-1 rounded">
                        SAMPLE
                      </div>
                    </div>
                    
                    {/* Report Details */}
                    <div className="space-y-3 text-sm">
                      {/* Header with certainty badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700 font-semibold">What Was Found</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            99.12%
                          </span>
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
                            High Certainty
                          </span>
                        </div>
                      </div>
                      
                      {/* Predicted Condition */}
                      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <div className="mb-2">
                          <span className="text-gray-600 font-medium text-xs">Predicted Condition:</span>
                          <p className="text-gray-900 font-bold text-lg">Tumor glioma</p>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium text-xs">Certainty Score:</span>
                          <p className="text-blue-600 font-bold">99.12%</p>
                        </div>
                      </div>
                      
                      {/* Language badges */}
                      <div className="flex gap-2 pt-2">
                        <div className="flex-1 p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-white text-center text-xs font-semibold flex items-center justify-center gap-1">
                          <FileText className="w-3 h-3" />
                          English
                        </div>
                        <div className="flex-1 p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white text-center text-xs font-semibold flex items-center justify-center gap-1">
                          <FileText className="w-3 h-3" />
                          हिंदी
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating badge */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-3 -right-3 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold"
                  >
                    ✓ AI Powered
                  </motion.div>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-2xl transform rotate-3 opacity-20 -z-10"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full text-black mb-3">
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-200 mb-2">{stat.value}</h3>
                  <p className="text-gray-400 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why Choose आरोग्यPath?
              </h2>
              <p className="text-xl text-white max-w-3xl mx-auto">
                Experience cutting-edge AI technology combined with comprehensive healthcare information
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-black mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-cyan-400">{feature.title}</h3>
                  <p className="text-white leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 text-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-cyan-400">
                How It Works
              </h2>
              <p className="text-xl text-white max-w-3xl mx-auto">
                Get your MRI diagnosis in 4 simple steps
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black rounded-full flex items-center justify-center font-bold text-xl">
                        {item.step}
                      </div>
                      <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                        {item.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-cyan-400">{item.title}</h3>
                    <p className="text-white">{item.description}</p>
                  </div>
                  
                  {/* Arrow connector */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-cyan-400/50" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link href="/diagnosis">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-black px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all inline-flex items-center gap-2"
                >
                  Start Your Diagnosis Now
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* CTA Section - Only show when not logged in */}
        {!isAuthenticated() && (
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-12 text-center shadow-2xl border border-gray-700"
              >
                <h2 className="text-4xl font-bold mb-4 text-white">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Join thousands of users who trust आरोग्यPath for accurate MRI analysis and hospital recommendations
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-black px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all"
                    >
                      Create Free Account
                    </motion.button>
                  </Link>
                  <Link href="/diagnosis">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-black px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all"
                    >
                      Try Demo
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Feedback Form Modal */}
        <FeedbackForm 
          isOpen={isFeedbackOpen} 
          onClose={() => setIsFeedbackOpen(false)} 
        />

        {/* Floating Feedback Button */}
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black p-4 rounded-full shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all z-40 group"
        >
          <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Send Feedback
          </span>
        </button>
      </div>
    </>
  )
}
