import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const ayushmanIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png',
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
  pmjay_empaneled: boolean;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface HospitalMapProps {
  hospitals: Hospital[];
  userLocation: { lat: number; lng: number } | null;
  className?: string;
}

// Component to handle map view updates
const MapViewController: React.FC<{ hospitals: Hospital[]; userLocation: { lat: number; lng: number } | null }> = ({ 
  hospitals, 
  userLocation 
}) => {
  const map = useMap();

  useEffect(() => {
    if (hospitals.length > 0 || userLocation) {
      const bounds = L.latLngBounds([]);
      
      // Add user location to bounds
      if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng]);
      }
      
      // Add hospital locations to bounds
      hospitals.forEach(hospital => {
        if (hospital.latitude && hospital.longitude) {
          bounds.extend([hospital.latitude, hospital.longitude]);
        }
      });
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [hospitals, userLocation, map]);

  return null;
};

const HospitalMap: React.FC<HospitalMapProps> = ({ hospitals, userLocation, className = '' }) => {
  // Default center (India)
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const mapCenter: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  // Filter hospitals with valid coordinates
  const validHospitals = hospitals.filter(hospital => 
    hospital.latitude && 
    hospital.longitude && 
    !isNaN(hospital.latitude) && 
    !isNaN(hospital.longitude)
  );

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg relative ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={userLocation ? 12 : 6}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-blue-800">Your Location</h3>
                <p className="text-sm text-gray-600">Current position</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Hospital markers */}
        {validHospitals.map((hospital) => (
          <Marker
            key={hospital._id}
            position={[hospital.latitude!, hospital.longitude!]}
            icon={hospital.pmjay_empaneled ? ayushmanIcon : hospitalIcon}
          >
            <Popup maxWidth={300}>
              <div className="p-2">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm flex-1">
                    {hospital.name}
                  </h3>
                  {hospital.pmjay_empaneled && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium ml-2">
                      Ayushman
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <p><strong>Location:</strong> {hospital.city}, {hospital.district}</p>
                  <p><strong>State:</strong> {hospital.state}</p>
                  <p><strong>Pincode:</strong> {hospital.pincode}</p>
                  
                  {hospital.distance && (
                    <p><strong>Distance:</strong> <span className="text-blue-600 font-medium">{hospital.distance} km</span></p>
                  )}
                  
                  {hospital.specialty && (
                    <p><strong>Type:</strong> {hospital.specialty}</p>
                  )}
                </div>
                
                <div className="flex space-x-2 mt-3">
                  {hospital.phone && (
                    <a
                      href={`tel:${hospital.phone}`}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                    >
                      Call
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                  >
                    Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Map view controller */}
        <MapViewController hospitals={validHospitals} userLocation={userLocation} />
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
        <h4 className="text-sm font-semibold mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Ayushman Bharat Hospital</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Other Hospital</span>
          </div>
        </div>
      </div>
      
      {/* Hospital count indicator */}
      {validHospitals.length > 0 && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md z-[1000]">
          <p className="text-sm font-medium text-gray-800">
            {validHospitals.length} hospital{validHospitals.length !== 1 ? 's' : ''} shown
          </p>
        </div>
      )}
    </div>
  );
};

export default HospitalMap;
