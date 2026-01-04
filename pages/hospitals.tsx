import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { MapPinIcon, MagnifyingGlassIcon, FunnelIcon, HeartIcon, PhoneIcon, GlobeAltIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'

// State coordinates mapping
const STATE_COORDINATES: { [key: string]: [number, number] } = {
  'ANDHRA PRADESH': [15.9129, 79.7400],
  'ARUNACHAL PRADESH': [28.2180, 94.7278],
  'ASSAM': [26.2006, 92.9376],
  'BIHAR': [25.0961, 85.3131],
  'CHHATTISGARH': [21.2787, 81.8661],
  'GOA': [15.2993, 74.1240],
  'GUJARAT': [23.0225, 72.5714],
  'HARYANA': [29.0588, 76.0856],
  'HIMACHAL PRADESH': [31.1048, 77.1734],
  'JHARKHAND': [23.6102, 85.2799],
  'KARNATAKA': [15.3173, 75.7139],
  'KERALA': [10.8505, 76.2711],
  'MADHYA PRADESH': [22.9734, 78.6569],
  'MAHARASHTRA': [19.7515, 75.7139],
  'MANIPUR': [24.6637, 93.9063],
  'MEGHALAYA': [25.4670, 91.3662],
  'MIZORAM': [23.1645, 92.9376],
  'NAGALAND': [26.1584, 94.5624],
  'ODISHA': [20.9517, 85.0985],
  'PUNJAB': [31.1471, 75.3412],
  'RAJASTHAN': [27.0238, 74.2179],
  'SIKKIM': [27.5330, 88.5122],
  'TAMIL NADU': [11.1271, 78.6569],
  'TELANGANA': [18.1124, 79.0193],
  'TRIPURA': [23.9408, 91.9882],
  'UTTAR PRADESH': [26.8467, 80.9462],
  'UTTARAKHAND': [30.0668, 79.0193],
  'WEST BENGAL': [22.9868, 87.8550],
  'NCT OF DELHI': [28.7041, 77.1025],
  'JAMMU AND KASHMIR': [34.0837, 74.7973],
  'LADAKH': [34.1526, 77.5771],
  'CHANDIGARH': [30.7333, 76.7794],
  'DADRA AND NAGAR HAVELI': [20.1809, 73.0169],
  'DAMAN AND DIU': [20.4283, 72.8397],
  'LAKSHADWEEP': [10.5667, 72.6417],
  'PUDUCHERRY': [11.9416, 79.8083],
  'ANDAMAN ANDNICOBAR I': [11.7401, 92.6586]
};

// Dynamically import the map component to avoid SSR issues
const HospitalMap = dynamic(() => import('@/components/HospitalMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-400">Loading map...</p>
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

interface Pagination {
  current_page: number
  total_pages: number
  total_results: number
  per_page: number
}

// Helper function to determine if hospital is government or private
const isGovernmentHospital = (hospitalName: string): boolean => {
  const name = hospitalName.toLowerCase()
  return name.includes('government') || 
         name.includes('district hospital') ||
         name.includes('medical college') ||
         name.includes('aiims') ||
         name.includes('state') ||
         name.includes('municipal') ||
         name.includes('civil hospital') ||
         name.includes('primary health') ||
         name.includes('community health')
}

// Helper function to generate Google Maps directions URL
const getGoogleMapsDirectionsUrl = (hospital: Hospital): string => {
  // Create destination string from available hospital information
  const addressParts = [
    hospital.name,
    hospital.address,
    hospital.city,
    hospital.state,
    hospital.pincode
  ].filter(part => part && part.trim() !== '').join(', ')
  
  // Encode the destination for URL
  const destination = encodeURIComponent(addressParts)
  
  // Return Google Maps directions URL (will use user's current location as starting point)
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`
}

// Helper function to geocode hospital address using Nominatim (OpenStreetMap)
const geocodeHospitalAddress = async (hospital: Hospital): Promise<Hospital | null> => {
  try {
    // Strategy 1: Try with full details
    let searchParts = [
      hospital.name,
      hospital.address,
      hospital.city,
      hospital.state,
      'India'
    ].filter(part => part && part.trim() !== '')
    
    let query = encodeURIComponent(searchParts.join(', '))
    
    let response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=in`,
      {
        headers: {
          'User-Agent': 'आरोग्यPath Hospital Locator'
        }
      }
    )
    
    let data = await response.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      return {
        ...hospital,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      }
    }
    
    // Strategy 2: Try with just city and state (for approximate location)
    console.log('Full search failed, trying city/state...')
    searchParts = [
      hospital.city || hospital.district,
      hospital.state,
      'India'
    ].filter(part => part && part.trim() !== '')
    
    query = encodeURIComponent(searchParts.join(', '))
    
    response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=in`,
      {
        headers: {
          'User-Agent': 'आरोग्यPath Hospital Locator'
        }
      }
    )
    
    data = await response.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      return {
        ...hospital,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      }
    }
    
    return null
  } catch (error) {
    console.error('Geocoding error for hospital:', hospital.name, error)
    return null
  }
}

export default function FindHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedState, setSelectedState] = useState('MAHARASHTRA')
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [ayushmanFilter, setAyushmanFilter] = useState('all')
  const [hospitalTypeFilter, setHospitalTypeFilter] = useState('all') // government, private, all
  const [states, setStates] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hospitalStats, setHospitalStats] = useState({
    total: 0,
    government: 0,
    private: 0,
    ayushman: 0
  })
  const [geocodedHospitals, setGeocodedHospitals] = useState<Hospital[]>([])
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [stateCenterMarker, setStateCenterMarker] = useState<{lat: number, lng: number, name: string} | null>(null)

  // Fetch states on component mount
  useEffect(() => {
    fetchStates()
    // Initial search for Maharashtra and set center marker
    setTimeout(() => {
      searchHospitals(1)
      // Set initial state center marker for Maharashtra
      if (STATE_COORDINATES['MAHARASHTRA']) {
        const [lat, lng] = STATE_COORDINATES['MAHARASHTRA']
        setStateCenterMarker({ lat, lng, name: 'MAHARASHTRA' })
      }
    }, 500)
  }, [])

  // Fetch districts when state changes
  useEffect(() => {
    if (selectedState && selectedState !== 'all') {
      fetchDistricts(selectedState)
    } else {
      setDistricts([])
    }
  }, [selectedState])

  // Trigger search when filters change
  useEffect(() => {
    if (selectedState !== '') {
      searchHospitals(1)
    }
  }, [selectedState, ayushmanFilter, hospitalTypeFilter])

  const fetchStates = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/hospitals/states')
      const data = await response.json()
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
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '20')

      if (searchQuery) params.append('query', searchQuery)
      if (selectedState !== 'all') params.append('state', selectedState)
      if (selectedDistrict !== 'all') params.append('district', selectedDistrict)
      if (ayushmanFilter !== 'all') params.append('ayushman', ayushmanFilter)
      if (hospitalTypeFilter !== 'all') params.append('type', hospitalTypeFilter)
      
      console.log('Search params:', params.toString())
      
      // Only use location filtering if user explicitly enables their location
      if (userLocation) {
        params.append('lat', userLocation.lat.toString())
        params.append('lng', userLocation.lng.toString())
        params.append('radius', '100')
      }

      const response = await fetch(`http://localhost:3001/api/hospitals/search?${params}`)
      const data = await response.json()
      
      const filteredHospitals = data.hospitals || []
      
      setHospitals(filteredHospitals)
      setCurrentPage(data.pagination?.current_page || 1)
      setTotalPages(data.pagination?.total_pages || 1)
      
      // Update stats based on filtered results
      const total = filteredHospitals.length
      const government = filteredHospitals.filter((h: Hospital) => h.type === 'Government').length
      const private_count = filteredHospitals.filter((h: Hospital) => h.type === 'Private').length
      const ayushman = filteredHospitals.filter((h: Hospital) => h.pmjay_empaneled === true).length
      
      // Debug logging
      console.log('Stats calculation:')
      console.log('Total hospitals:', total)
      console.log('Government count:', government)
      console.log('Private count:', private_count)
      console.log('Sample hospital types:', filteredHospitals.slice(0, 3).map(h => ({ name: h.name, type: h.type })))
      
      setHospitalStats({
        total,
        government,
        private: private_count,
        ayushman
      })
      
      // Start geocoding process for hospitals without coordinates
      geocodeHospitals(filteredHospitals)
    } catch (error) {
      console.error('Error searching hospitals:', error)
      setHospitals([])
    } finally {
      setLoading(false)
    }
  }
  
  // Function to geocode multiple hospitals (optimized)
  const geocodeHospitals = async (hospitalsToGeocode: Hospital[]) => {
    if (hospitalsToGeocode.length === 0) return
    
    setIsGeocoding(true)
    
    // Immediately set hospitals that already have coordinates
    const hospitalsWithCoords = hospitalsToGeocode.filter(h => h.latitude && h.longitude)
    if (hospitalsWithCoords.length > 0) {
      setGeocodedHospitals(hospitalsWithCoords)
    }
    
    // Get hospitals that need geocoding
    const hospitalsToProcess = hospitalsToGeocode
      .filter(h => !h.latitude || !h.longitude)
      .slice(0, 5) // Only geocode first 5 for faster initial display
    
    if (hospitalsToProcess.length === 0) {
      setIsGeocoding(false)
      return
    }
    
    // Process in smaller batches with parallel requests
    const batchSize = 3
    const geocoded: Hospital[] = [...hospitalsWithCoords]
    
    for (let i = 0; i < hospitalsToProcess.length; i += batchSize) {
      const batch = hospitalsToProcess.slice(i, i + batchSize)
      
      // Geocode batch in parallel
      const batchResults = await Promise.all(
        batch.map(hospital => geocodeHospitalAddress(hospital))
      )
      
      // Add results to geocoded array
      batchResults.forEach((result, idx) => {
        if (result) {
          geocoded.push(result)
        } else {
          geocoded.push(batch[idx]) // Keep original if geocoding fails
        }
      })
      
      // Update map with newly geocoded hospitals immediately
      setGeocodedHospitals([...geocoded])
      
      // Small delay between batches (reduced from 1000ms to 300ms)
      if (i + batchSize < hospitalsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }
    
    setIsGeocoding(false)
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    searchHospitals(1)
  }

  // Handler for state selection - shows purple marker at state center
  const handleStateChange = (state: string) => {
    setSelectedState(state)
    
    // Set state center marker if valid state is selected
    if (state && state !== 'all' && STATE_COORDINATES[state]) {
      const [lat, lng] = STATE_COORDINATES[state]
      setStateCenterMarker({ lat, lng, name: state })
    } else {
      setStateCenterMarker(null)
    }
  }

  // Handler for clicking a hospital card - focuses on that hospital
  const handleHospitalClick = async (hospital: Hospital) => {
    console.log('Hospital card clicked:', hospital.name)
    
    // Use database coordinates directly
    if (hospital.latitude && hospital.longitude) {
      console.log('Using database coordinates:', hospital.latitude, hospital.longitude)
      setSelectedHospital(hospital)
    } else {
      console.log('No coordinates available for this hospital')
      alert(`Location coordinates not available for "${hospital.name}".\n\nFor directions:\n• Click the "🗺️ Directions" button\n• This will open Google Maps`)
    }
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          searchHospitals(1)
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

  return (
    <>
      <Head>
        <title>Find Hospitals - आरोग्यPath</title>
        <meta name="description" content="Find hospitals near you with Ayushman Bharat support" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          
          {/* Header Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-cyan-500/20 rounded-full mb-6">
              <span className="text-cyan-400 font-semibold text-sm">🏥 Hospital Finder</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Hospitals</span> Near You
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
              Search from 32,000+ hospitals including government and Ayushman Bharat empanelled facilities across India
            </p>
            
            <div className="bg-gray-900 rounded-2xl shadow-xl p-8 border border-cyan-500/20">
              
              {/* Loading/Search Bar */}
              {loading && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-green-800 font-medium">Loading PMJAY hospital database...</span>
                </div>
              )}

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search hospitals by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-cyan-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-900/90 text-white placeholder-gray-400"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/50"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Search
                </button>
                <button
                  onClick={getUserLocation}
                  className="bg-gray-900 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <MapPinIcon className="w-5 h-5" />
                  My Location
                </button>
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* State Selector */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Select State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-cyan-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-900/90 text-white"
                  >
                    <option value="all">All States</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Hospital Type Filter */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Hospital Type</label>
                  <select
                    value={hospitalTypeFilter}
                    onChange={(e) => setHospitalTypeFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-cyan-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-900/90 text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                {/* PMJAY Filter */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">PMJAY Status</label>
                  <select
                    value={ayushmanFilter}
                    onChange={(e) => setAyushmanFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-cyan-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-900/90 text-white"
                  >
                    <option value="all">All Hospitals</option>
                    <option value="yes">PMJAY Empanelled Only</option>
                    <option value="no">Non-PMJAY Only</option>
                  </select>
                </div>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex gap-3 mb-6 flex-wrap">
                <button 
                  onClick={() => { setSelectedState('all'); setHospitalTypeFilter('all'); setAyushmanFilter('all'); setSearchQuery(''); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedState === 'all' && hospitalTypeFilter === 'all' ? 'bg-cyan-500 text-black' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  All Hospitals
                </button>
                <button 
                  onClick={() => { setHospitalTypeFilter('government'); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    hospitalTypeFilter === 'government' ? 'bg-green-600 text-white' : 'bg-green-600/20 text-green-400 border border-green-500/30'
                  }`}
                >
                  🏛️ Government
                </button>
                <button 
                  onClick={() => { setHospitalTypeFilter('private'); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    hospitalTypeFilter === 'private' ? 'bg-orange-600 text-white' : 'bg-orange-600/20 text-orange-400 border border-orange-500/30'
                  }`}
                >
                  🏥 Private
                </button>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-cyan-500/10 rounded-xl p-4 text-center border border-cyan-500/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-cyan-400">{hospitalStats.total}</div>
                  <div className="text-cyan-300 text-sm font-medium mt-1">Total Found</div>
                </div>
                <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-green-400">{hospitalStats.government}</div>
                  <div className="text-green-300 text-sm font-medium mt-1">Government</div>
                </div>
                <div className="bg-orange-500/10 rounded-xl p-4 text-center border border-orange-500/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-orange-400">{hospitalStats.private}</div>
                  <div className="text-orange-300 text-sm font-medium mt-1">Private</div>
                </div>
                <div className="bg-purple-500/10 rounded-xl p-4 text-center border border-purple-500/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-purple-400">{hospitalStats.ayushman}</div>
                  <div className="text-purple-300 text-sm font-medium mt-1">PMJAY</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map and Results Section */}
          <motion.div 
            className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="grid lg:grid-cols-3 gap-0">
              {/* Map */}
              <div className="lg:col-span-2">
                <HospitalMap
                  hospitals={geocodedHospitals.length > 0 ? geocodedHospitals : hospitals}
                  userLocation={userLocation}
                  selectedState={selectedState}
                  selectedHospital={selectedHospital}
                  stateCenterMarker={stateCenterMarker}
                  className="h-96 lg:h-[600px]"
                />
                {isGeocoding && (
                  <div className="absolute top-2 right-2 bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 shadow-lg z-[1000]">
                    <div className="flex items-center text-xs text-gray-400">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      Loading map locations...
                    </div>
                  </div>
                )}
              </div>

              {/* Hospital Results Sidebar */}
              <div className="lg:col-span-1 border-l border-cyan-500/30 max-h-[600px] overflow-y-auto">
                {hospitals.length > 0 && (
                  <div className="p-4">
                    <div className="text-sm text-gray-400 mb-4">
                      Found {hospitals.length} hospitals {userLocation ? 'sorted by distance' : `in ${selectedState !== 'all' ? selectedState : 'database'}`}
                    </div>
                    
                    {hospitals.map((hospital, index) => {
                      const isSelected = selectedHospital && selectedHospital._id === hospital._id;
                      return (
                      <div 
                        key={hospital._id || index} 
                        className={`border-b border-cyan-500/20 pb-4 mb-4 last:border-b-0 cursor-pointer p-3 -m-3 rounded-lg transition-all ${
                          isSelected 
                            ? 'bg-orange-50 border-l-4 border-l-orange-500 shadow-md' 
                            : 'hover:bg-cyan-500/10'
                        }`}
                        onClick={() => handleHospitalClick(hospital)}
                      >
                        <div className="flex items-start">
                          <MapPinIcon className="w-5 h-5 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">
                              {hospital.name}
                            </h3>
                            <div className="text-xs text-gray-400 mb-2">
                              {hospital.state && `${hospital.state}${hospital.city ? `, ${hospital.city}` : ''}`}
                            </div>
                            
                            <div className="flex gap-2 mb-2">
                              {/* Hospital Type Badge */}
                              {hospital.type === 'Government' ? (
                                <div className="inline-flex items-center bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium border border-green-500/30">
                                  🏛️ Government
                                </div>
                              ) : hospital.type === 'Private' ? (
                                <div className="inline-flex items-center bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-medium border border-orange-500/30">
                                  🏥 Private
                                </div>
                              ) : null}
                              
                              {/* PMJAY Badge */}
                              {hospital.pmjay_empaneled && (
                                <div className="inline-flex items-center bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-medium border border-purple-500/30">
                                  ✓ PMJAY
                                </div>
                              )}
                            </div>
                            
                            <div className="text-xs text-gray-400">
                              {hospital.address ? hospital.address : 'Address not available'}
                            </div>
                            
                            {hospital.phone && (
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <PhoneIcon className="w-3 h-3 mr-1" />
                                {hospital.phone}
                              </div>
                            )}

                            {hospital.distance && (
                              <div className="text-xs text-cyan-400 mt-1 font-medium">
                                📍 {hospital.distance} km away
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-3">
                              {/* Google Maps Directions Button */}
                              <a
                                href={getGoogleMapsDirectionsUrl(hospital)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center bg-cyan-500 text-black px-3 py-1 rounded text-xs font-medium hover:bg-cyan-600 transition-colors"
                              >
                                🗺️ Directions
                              </a>

                              {/* Call Button */}
                              {hospital.phone && (
                                <a
                                  href={`tel:${hospital.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center bg-green-500 text-black px-3 py-1 rounded text-xs font-medium hover:bg-green-600 transition-colors"
                                >
                                  📞 Call
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )})}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center space-x-2 mt-4">
                        <button
                          onClick={() => searchHospitals(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded disabled:opacity-50 hover:bg-cyan-500/30 transition-colors"
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-white">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => searchHospitals(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded disabled:opacity-50 hover:bg-cyan-500/30 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {hospitals.length === 0 && !loading && (
                  <div className="p-8 text-center text-gray-400">
                    <MapPinIcon className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p>No hospitals found. Try adjusting your search.</p>
                  </div>
                )}

                {loading && (
                  <div className="p-8 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <p>Searching hospitals...</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}