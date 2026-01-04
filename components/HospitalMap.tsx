import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// State coordinates mapping for centering the map
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

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const governmentHospitalIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const privateHospitalIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const unknownHospitalIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const stateCenterIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [35, 57],
  iconAnchor: [17, 57],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
  popupAnchor: [0, -57],
});

const selectedHospitalIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [35, 57],
  iconAnchor: [17, 57],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
  popupAnchor: [0, -57],
});

// Function to determine icon based on hospital type
const getHospitalIcon = (hospital: Hospital, isSelected: boolean) => {
  if (isSelected) {
    return selectedHospitalIcon;
  }
  
  if (hospital.type === 'Government') {
    return governmentHospitalIcon;
  } else if (hospital.type === 'Private') {
    return privateHospitalIcon;
  } else {
    return unknownHospitalIcon;
  }
};

interface Hospital {
  _id: string;
  name: string;
  state: string;
  district?: string;
  city: string;
  address: string;
  pincode: string;
  phone: string;
  specialty: string;
  type?: string;
  pmjay_empaneled: boolean;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface HospitalMapProps {
  hospitals: Hospital[];
  userLocation: { lat: number; lng: number } | null;
  selectedState?: string;
  selectedHospital?: Hospital | null;
  stateCenterMarker?: { lat: number; lng: number; name: string } | null;
  className?: string;
}

// Component to handle map view updates
const MapViewController: React.FC<{ 
  hospitals: Hospital[]; 
  userLocation: { lat: number; lng: number } | null;
  selectedState?: string;
  selectedHospital?: Hospital | null;
}> = ({ hospitals, userLocation, selectedState, selectedHospital }) => {
  const map = useMap();

  // Update view when a hospital is clicked (highest priority - instant response)
  useEffect(() => {
    if (selectedHospital && selectedHospital.latitude && selectedHospital.longitude) {
      map.flyTo([selectedHospital.latitude, selectedHospital.longitude], 16, { duration: 0.8 });
      // Open popup after animation
      setTimeout(() => {
        map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            const latLng = layer.getLatLng();
            if (latLng.lat === selectedHospital.latitude && latLng.lng === selectedHospital.longitude) {
              layer.openPopup();
            }
          }
        });
      }, 800);
    }
  }, [selectedHospital, map]);

  // Update view when state changes (second priority - instant response)
  useEffect(() => {
    // Don't interfere if a hospital is selected
    if (selectedHospital) return;
    
    if (selectedState && selectedState !== 'all' && STATE_COORDINATES[selectedState]) {
      const [lat, lng] = STATE_COORDINATES[selectedState];
      map.flyTo([lat, lng], 9, { duration: 0.5 }); // Increased from 7 to 9 for more detail
    }
  }, [selectedState, map, selectedHospital]);

  // Update view when user location changes
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 10, { duration: 0.8 });
    }
  }, [userLocation, map]);

  // Update bounds when hospitals with coordinates become available
  useEffect(() => {
    // Skip if we're already centered on user location, state, or selected hospital
    if (userLocation || selectedHospital || (selectedState && selectedState !== 'all')) return;

    const hospitalsWithCoords = hospitals.filter(h => h.latitude && h.longitude);
    if (hospitalsWithCoords.length > 0) {
      const bounds = L.latLngBounds([]);
      hospitalsWithCoords.forEach(hospital => {
        bounds.extend([hospital.latitude!, hospital.longitude!]);
      });
      map.fitBounds(bounds, { padding: [20, 20], duration: 0.5 });
    }
  }, [hospitals, userLocation, selectedState, selectedHospital, map]);

  return null;
};

const HospitalMap: React.FC<HospitalMapProps> = ({ 
  hospitals, 
  userLocation, 
  selectedState, 
  selectedHospital,
  stateCenterMarker,
  className = '' 
}) => {
  // Determine initial center based on selected state or default
  const getInitialCenter = (): [number, number] => {
    if (userLocation) return [userLocation.lat, userLocation.lng];
    if (selectedState && selectedState !== 'all' && STATE_COORDINATES[selectedState]) {
      return STATE_COORDINATES[selectedState];
    }
    return [20.5937, 78.9629]; // Default India center
  };
  
  const mapCenter = getInitialCenter();
  const initialZoom = selectedState && selectedState !== 'all' ? 9 : 5; // Increased from 7 to 9 for more detail

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        scrollWheelZoom={true}
        zoomControl={true}
        key={`${selectedState}-${userLocation?.lat}-${userLocation?.lng}`}
      >
        {/* Using multiple tile layer options for better detail */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={3}
          subdomains={['a', 'b', 'c']}
        />
        
        {/* Auto-adjust map view */}
        <MapViewController 
          hospitals={hospitals} 
          userLocation={userLocation} 
          selectedState={selectedState}
          selectedHospital={selectedHospital}
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-blue-600">Your Location</h3>
              </div>
            </Popup>
          </Marker>
        )}

        {/* State center marker - ALWAYS show when state is selected */}
        {stateCenterMarker && (
          <Marker
            position={[stateCenterMarker.lat, stateCenterMarker.lng]}
            icon={stateCenterIcon}
          >
            <Popup>
              <div className="p-3">
                <h3 className="font-semibold text-purple-600 mb-2 text-lg">📍 {stateCenterMarker.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  State Center
                </p>
                <div className="text-xs text-gray-500">
                  Found {hospitals.length} hospitals in this state
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Selected Hospital Marker - Shows when a hospital card is clicked */}
        {selectedHospital && selectedHospital.latitude && selectedHospital.longitude && (
          <Marker
            position={[selectedHospital.latitude, selectedHospital.longitude]}
            icon={selectedHospitalIcon}
          >
            <Popup>
              <div className="min-w-[250px] p-2">
                <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded mb-2 inline-block">
                  📍 Selected Hospital
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {selectedHospital.name}
                </h3>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {selectedHospital.type === 'Government' && (
                    <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      🏛️ Government
                    </div>
                  )}
                  {selectedHospital.type === 'Private' && (
                    <div className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      🏥 Private
                    </div>
                  )}
                  {selectedHospital.pmjay_empaneled && (
                    <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      ✓ PMJAY
                    </div>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>State:</strong> {selectedHospital.state}</p>
                  {selectedHospital.city && (
                    <p><strong>City:</strong> {selectedHospital.city}</p>
                  )}
                  {selectedHospital.address && (
                    <p><strong>Address:</strong> {selectedHospital.address}</p>
                  )}
                  {selectedHospital.pincode && (
                    <p><strong>Pincode:</strong> {selectedHospital.pincode}</p>
                  )}
                  {selectedHospital.phone && (
                    <div className="flex items-center mt-2">
                      <span className="mr-2">📞</span>
                      <a 
                        href={`tel:${selectedHospital.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedHospital.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Hospital markers */}
        {hospitals.map((hospital) => {
          if (!hospital.latitude || !hospital.longitude) return null;
          
          // Check if this is the selected hospital
          const isSelected = selectedHospital && 
            selectedHospital._id === hospital._id &&
            selectedHospital.latitude === hospital.latitude &&
            selectedHospital.longitude === hospital.longitude;
          
          // Choose icon based on selection and hospital type
          const markerIcon = getHospitalIcon(hospital, isSelected);
          
          return (
            <Marker
              key={hospital._id}
              position={[hospital.latitude, hospital.longitude]}
              icon={markerIcon}
            >
              <Popup>
                <div className="min-w-[250px] p-2">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {hospital.name}
                  </h3>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {hospital.type === 'Government' && (
                      <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        🏛️ Government
                      </div>
                    )}
                    {hospital.type === 'Private' && (
                      <div className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        🏥 Private
                      </div>
                    )}
                    {hospital.pmjay_empaneled && (
                      <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        ✓ PMJAY
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>State:</strong> {hospital.state}</p>
                    {hospital.city && (
                      <p><strong>City:</strong> {hospital.city}</p>
                    )}
                    {hospital.address && (
                      <p><strong>Address:</strong> {hospital.address}</p>
                    )}
                    {hospital.pincode && (
                      <p><strong>Pincode:</strong> {hospital.pincode}</p>
                    )}
                    {hospital.specialty && (
                      <p><strong>Specialty:</strong> {hospital.specialty}</p>
                    )}
                    {hospital.distance && (
                      <p><strong>Distance:</strong> {hospital.distance} km</p>
                    )}
                  </div>
                  
                  {hospital.phone && (
                    <a 
                      href={`tel:${hospital.phone}`}
                      className="inline-block mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Call Hospital
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 shadow-lg shadow-cyan-500/20 border border-cyan-500/30 z-[1000]">
        <h4 className="font-semibold text-sm mb-2 text-white">Legend</h4>
        <div className="space-y-1 text-xs">
          {userLocation && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-white">Your Location</span>
            </div>
          )}
          {selectedState && selectedState !== 'all' && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-white">{selectedState} State Center</span>
            </div>
          )}
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-white">PMJAY Empaneled Hospital</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-white">Other Hospital</span>
          </div>
          {selectedState && selectedState !== 'all' && hospitals.filter(h => h.latitude && h.longitude).length === 0 && (
            <div className="text-xs text-gray-400 mt-2 max-w-[200px]">
              <i>Loading hospital locations on map from addresses...</i>
            </div>
          )}
        </div>
      </div>

      {/* Zoom tip */}
      <div className="absolute top-4 right-4 bg-cyan-500/90 backdrop-blur-sm text-black rounded-lg px-3 py-2 shadow-lg shadow-cyan-500/30 border border-cyan-400 z-[1000] text-xs">
        <div className="font-semibold mb-1">💡 Map Tips:</div>
        <div>• Use scroll wheel to zoom in/out</div>
        <div>• Click + zoom buttons on left</div>
        <div>• Click hospital cards to locate</div>
      </div>
    </div>
  );
};

export default HospitalMap;