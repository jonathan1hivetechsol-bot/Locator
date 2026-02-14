import React, { useState, useEffect, useRef } from 'react';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { 
  MapPin, 
  Battery,
  Clock,
  Navigation,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface BagData {
  lat: number;
  lng: number;
  lastUpdated: Date;
  isSimulated: boolean;
  batteryLevel: number | string;
  deviceAgent: string;
  sendCount: number;
}

interface ViewerScreenProps {
  bagId: string;
  appId: string;
  db: Firestore;
  user: any;
  isMobile: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

const ViewerScreen: React.FC<ViewerScreenProps> = ({
  bagId,
  appId,
  db,
  user,
  isMobile
}) => {
  const [data, setData] = useState<BagData | null>(null);
  const [loading, setLoading] = useState(true);
  const [libLoaded, setLibLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load Leaflet dynamically via CDN
  useEffect(() => {
    if (window.L) {
      setLibLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLibLoaded(true);
    };
    script.onerror = () => {
      setError('Failed to load map library');
    };
    document.body.appendChild(script);

    return () => {
      if (link.parentNode) document.head.removeChild(link);
      if (script.parentNode) document.body.removeChild(script);
    };
  }, []);

  // Subscribe to Firestore updates
  useEffect(() => {
    if (!user || !autoRefresh) return;

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', `bag_${bagId}`);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data() as any;
          setData({
            lat: d.lat || 0,
            lng: d.lng || 0,
            lastUpdated: d.lastUpdated ? new Date(d.lastUpdated.seconds * 1000) : new Date(),
            isSimulated: d.isSimulated || false,
            batteryLevel: d.batteryLevel || 'Unknown',
            deviceAgent: d.deviceAgent || '',
            sendCount: d.sendCount || 0
          });
          setError(null);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (error: any) => {
        console.error("Error fetching bag data:", error);
        if (error.code === 'permission-denied') {
          setError('Permission denied. Bag ID may be incorrect.');
        } else {
          setError(`Error: ${error.message}`);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [bagId, user, appId, db, autoRefresh]);

  // Initialize and update map
  useEffect(() => {
    if (!data || !libLoaded || !window.L) return;

    const { lat, lng } = data;
    const mapContainer = mapRef.current;

    if (!mapContainer) return;

    try {
      if (!mapInstanceRef.current) {
        // Fix Leaflet's default icon path issues
        delete (window.L.Icon.Default.prototype as any)._getIconUrl;
        window.L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Initialize map
        const map = window.L.map(mapContainer).setView([lat, lng], 15);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);
        
        const marker = window.L.marker([lat, lng], {
          title: `Bag ${bagId}`
        }).addTo(map);
        
        marker.bindPopup(createPopupContent(data, bagId)).openPopup();
        
        mapInstanceRef.current = map;
        markerRef.current = marker;

        // Handle resize
        const handleResize = () => map.invalidateSize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      } else {
        // Update existing map
        const map = mapInstanceRef.current;
        const marker = markerRef.current;
        
        marker.setLatLng([lat, lng]);
        map.setView([lat, lng], map.getZoom());
        marker.setPopupContent(createPopupContent(data, bagId));
        if (marker.isPopupOpen?.()) {
          marker.updatePopup();
        }
      }
    } catch (err: any) {
      console.error('Map error:', err);
      setError('Failed to load map');
    }
  }, [data, bagId, libLoaded]);

  const createPopupContent = (bagData: BagData, id: string) => {
    return `
      <div class="text-sm">
        <b>Bag ${id}</b><br/>
        <small>Updated: ${bagData.lastUpdated.toLocaleTimeString()}</small>
      </div>
    `;
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const openInGoogleMaps = () => {
    if (!data) return;
    const url = `https://www.google.com/maps?q=${data.lat},${data.lng}`;
    window.open(url, '_blank');
  };

  if (loading || !libLoaded) {
    return (
      <div className={`flex-1 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 min-h-[calc(100vh-80px)]`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full animate-bounce">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-slate-600 font-medium">{!libLoaded ? 'Loading maps...' : 'Connecting to bag...'}</p>
          <p className="text-xs text-slate-400 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-80px)] bg-slate-100`}>
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Connection Error</h3>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <p className="text-xs text-slate-500">
            Make sure the other device is in "Tracker Mode" with ID <strong>{bagId}</strong>
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 to-slate-100`}>
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="bg-slate-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Waiting for Signal</h3>
          <p className="text-slate-600 text-sm mb-4">The bag tracker hasn't sent any data yet.</p>
          <p className="text-xs text-slate-500 mb-6">
            Make sure the other device is in "Tracker Mode", has ID <strong>{bagId}</strong>, and has GPS/Location enabled.
          </p>
          <label className="flex items-center gap-2 cursor-pointer justify-center">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Auto-refresh</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col relative min-h-[calc(100vh-80px)] ${isMobile ? '' : ''}`}>
      {/* Map Container */}
      <div 
        ref={mapRef}
        id="map-container" 
        className="flex-1 w-full bg-slate-200 z-0"
      />
      
      {/* Overlay Info Card */}
      <div className={`absolute ${isMobile ? 'bottom-4 left-4 right-4' : 'bottom-6 left-6 right-6'} z-[999]`}>
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 max-w-md">
          <div className="flex justify-between items-start mb-3 gap-2">
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                <MapPin className="w-4 h-4 text-blue-600" />
                Bag Location
                {data.isSimulated && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-normal">
                    SIMULATION
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {getTimeAgo(data.lastUpdated)}
              </p>
            </div>
            {typeof data.batteryLevel === 'number' && (
              <div className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-lg whitespace-nowrap">
                <Battery className="w-3 h-3" /> 
                {data.batteryLevel}%
              </div>
            )}
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2'} gap-2 mb-3`}>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="block text-slate-400 text-[10px] font-semibold mb-1">LATITUDE</span>
              <span className="text-sm font-mono text-slate-700">{data.lat.toFixed(6)}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="block text-slate-400 text-[10px] font-semibold mb-1">LONGITUDE</span>
              <span className="text-sm font-mono text-slate-700">{data.lng.toFixed(6)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
              <p className="text-blue-600 font-semibold">Sends: {data.sendCount}</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <p className="text-slate-600">{data.deviceAgent.split('/')[0].substring(0, 15)}</p>
            </div>
          </div>

          <button
            onClick={openInGoogleMaps}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Open in Google Maps
            <ExternalLink className="w-3 h-3" />
          </button>

          <label className="flex items-center gap-2 cursor-pointer mt-3 text-xs">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3 h-3 rounded"
            />
            <span className="text-slate-600">Live updates</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ViewerScreen;
