import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { MapPinIcon, MagnifyingGlassIcon, FunnelIcon, HeartIcon, PhoneIcon, GlobeAltIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'

// Dynamically import the map component to avoid SSR issues
const HospitalMap = dynamic(() => import('@/components/HospitalMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface Hospital {
  _id: string
  name: string
  address: string
  city: string
  state: string
  district?: string
  pincode: string
  phone: string
  specialty: string
  type?: string
  pmjay_empaneled: boolean
  latitude?: number
  longitude?: number
  distance?: number
}

export default function FindHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedState, setSelectedState] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [ayushmanFilter, setAyushmanFilter] = useState('all')
  const [states, setStates] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hospitalStats, setHospitalStats] = useState({
    total: 50,
    government: 1,
    private: 49,
    ayushman: 0
  })

  // Fetch states on component mount
  useEffect(() => {
    fetchStates()
  }, [])

  // Fetch districts when state changes
  useEffect(() => {
    if (selectedState && selectedState !== 'all') {
      fetchDistricts(selectedState)
    } else {
      setDistricts([])
      setSelectedDistrict('all')
    }
  }, [selectedState])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    }
  }, [])

  const fetchStates = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/hospitals/states')
      const data = await response.json()
      // Ensure data is an array
      if (Array.isArray(data)) {
        setStates(data)
      } else {
        console.error('States data is not an array:', data)
        setStates([])
      }
    } catch (error) {
      console.error('Error fetching states:', error)
      setStates([])
    }
  }

  const fetchDistricts = async (state: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/hospitals/districts/${encodeURIComponent(state)}`)
      const data = await response.json()
      // Ensure data is an array
      if (Array.isArray(data)) {
        setDistricts(data)
      } else {
        console.error('Districts data is not an array:', data)
        setDistricts([])
      }
    } catch (error) {
      console.error('Error fetching districts:', error)
      setDistricts([])
    }
  }

  const searchHospitals = async (page: number = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      if (searchQuery) params.append('query', searchQuery)
      if (selectedState !== 'all') params.append('state', selectedState)
      if (selectedDistrict !== 'all') params.append('district', selectedDistrict)
      if (ayushmanFilter !== 'all') params.append('ayushman', ayushmanFilter)
      if (userLocation) {
        params.append('lat', userLocation.lat.toString())
        params.append('lng', userLocation.lng.toString())
        params.append('radius', '100') // 100km radius
      }

      const response = await fetch(`http://localhost:3001/api/hospitals/search?${params}`)
      const data = await response.json()
      
      setHospitals(data.hospitals || [])
      setTotalPages(data.pagination?.total_pages || 1)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error searching hospitals:', error)
      setHospitals([])
    } finally {
      setLoading(false)
    }
  }

  const loadAyushmanHospitals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '50'
      })

      if (userLocation) {
        params.append('lat', userLocation.lat.toString())
        params.append('lng', userLocation.lng.toString())
        params.append('radius', '100')
      }

      const response = await fetch(`http://localhost:3001/api/hospitals/ayushman?${params}`)
      const data = await response.json()
      
      setHospitals(data.hospitals || [])
      setAyushmanFilter('yes')
      setCurrentPage(1)
    } catch (error) {
      console.error('Error loading Ayushman hospitals:', error)
      setHospitals([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    searchHospitals(1)
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          searchHospitals(1) // Search with location
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please search manually.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedState('all')
    setSelectedDistrict('all')
    setAyushmanFilter('all')
    setHospitals([])
    setCurrentPage(1)
  }

  return (
    <>
      <Head>
        <title>Find Hospitals - MediFinder</title>
        <meta name="description" content="Find hospitals near you with Ayushman Bharat support" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Header Section */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h1 className="text-4xl font-bold text-white mb-4">Find Hospitals</h1>
              
              {/* Loading/Search Bar */}
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-green-800 font-medium">Loading PMJAY hospital database...</span>
              </div>

              {/* Search Bar */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="mumbai"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  SEARCH
                </button>
                <button
                  onClick={getUserLocation}
                  className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <MapPinIcon className="w-5 h-5" />
                  USE MY LOCATION
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-3 mb-6">
                <button className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  All Hospitals
                </button>
                <button className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  Government
                </button>
                <button className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  Private
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  ✓ PMJAY Empanelled
                </button>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{hospitalStats.total}</div>
                  <div className="text-white/80 text-sm">TOTAL HOSPITALS</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{hospitalStats.government}</div>
                  <div className="text-white/80 text-sm">GOVERNMENT</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{hospitalStats.private}</div>
                  <div className="text-white/80 text-sm">PRIVATE</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{hospitalStats.ayushman}</div>
                  <div className="text-white/80 text-sm">AYUSHMAN</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map and Results Section */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="grid lg:grid-cols-3 gap-0">
              {/* Map */}
              <div className="lg:col-span-2">
                <HospitalMap
                  hospitals={hospitals}
                  userLocation={userLocation}
                  className="h-96 lg:h-[600px]"
                />
              </div>

              {/* Filter Toggle */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FunnelIcon className="w-5 h-5" />
                  <span className="font-medium">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                </button>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Searching...' : 'Search Hospitals'}
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All States</option>
                      {Array.isArray(states) && states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={selectedState === 'all'}
                    >
                      <option value="all">All Districts</option>
                      {Array.isArray(districts) && districts.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ayushman Bharat</label>
                    <select
                      value={ayushmanFilter}
                      onChange={(e) => setAyushmanFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Hospitals</option>
                      <option value="yes">Supported</option>
                      <option value="no">Not Supported</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hospital List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Searching hospitals...</p>
                </div>
              ) : hospitals.length > 0 ? (
                <>
                  <div className="text-sm text-gray-600 mb-4 font-medium">
                    Found {hospitals.length} hospitals
                    {userLocation && ' sorted by distance'}
                  </div>
                  
                  {hospitals.map((hospital) => (
                    <motion.div 
                      key={hospital._id} 
                      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 flex-1">
                          {hospital.name}
                        </h3>
                        {hospital.pmjay_empaneled && (
                          <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium ml-3">
                            ✅ Ayushman Bharat
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center">
                          <MapPinIcon className="w-5 h-5 mr-3 text-gray-400" />
                          <span>{hospital.city}, {hospital.district}, {hospital.state} - {hospital.pincode}</span>
                        </div>
                        
                        {hospital.distance && (
                          <div className="flex items-center">
                            <ArrowRightIcon className="w-5 h-5 mr-3 text-gray-400" />
                            <span className="font-medium text-blue-600">{hospital.distance} km away</span>
                          </div>
                        )}
                        
                        {hospital.type && (
                          <div className="flex items-center">
                            <HeartIcon className="w-5 h-5 mr-3 text-gray-400" />
                            <span>{hospital.type}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-3 mt-6">
                        {hospital.phone && (
                          <a
                            href={`tel:${hospital.phone}`}
                            className="flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            Call
                          </a>
                        )}
                        {hospital.website && (
                          <a
                            href={hospital.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center bg-gray-50 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <GlobeAltIcon className="w-4 h-4 mr-2" />
                            Website
                          </a>
                        )}
                        {hospital.latitude && hospital.longitude && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <ArrowRightIcon className="w-4 h-4 mr-2" />
                            Directions
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-3 mt-8">
                      <button
                        onClick={() => searchHospitals(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      
                      <span className="px-4 py-2 text-sm text-gray-600 font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button
                        onClick={() => searchHospitals(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <MapPinIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No hospitals found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or location.</p>
                </motion.div>
              )}
            </div>

            {/* Map */}
            <div className="lg:sticky lg:top-4">
              <HospitalMap 
                hospitals={hospitals} 
                userLocation={userLocation}
                className="h-96 lg:h-[600px] rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}