import React, { useState, useEffect } from 'react';
import type { Firestore } from 'firebase/firestore';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import { 
  Battery, 
  Copy, 
  Check, 
  AlertTriangle,
  Signal
} from 'lucide-react';

interface TrackerScreenProps {
  bagId: string;
  appId: string;
  db: Firestore;
  auth: Auth;
  copyToClipboard: () => void;
  copySuccess: boolean;
  isMobile: boolean;
}

const TrackerScreen: React.FC<TrackerScreenProps> = ({
  bagId,
  appId,
  db,
  copyToClipboard,
  copySuccess,
  isMobile
}) => {
  const [status, setStatus] = useState('Initializing...');
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [sendCount, setSendCount] = useState(0);
  const [isKeepAwake, setIsKeepAwake] = useState(false);

  // Get battery level
  useEffect(() => {
    const getBatteryLevel = async () => {
      try {
        const batteryStatus = await (navigator as any).getBattery?.();
        if (batteryStatus) {
          setBattery(Math.round(batteryStatus.level * 100));
          
          const updateBattery = () => {
            setBattery(Math.round(batteryStatus.level * 100));
          };
          
          batteryStatus.addEventListener('levelchange', updateBattery);
          return () => batteryStatus.removeEventListener('levelchange', updateBattery);
        }
      } catch (err) {
        console.log('Battery API not available');
      }
    };

    getBatteryLevel();
  }, []);

  // Keep screen awake functionality
  useEffect(() => {
    if (!isKeepAwake) return;

    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        wakeLock = await (navigator as any).wakeLock?.request('screen');
        console.log('Wake lock acquired');
      } catch (err) {
        console.error('Wake lock failed:', err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, [isKeepAwake]);

  // Send location function
  const sendLocation = async (lat: number, lng: number, isSimulated = false) => {
    try {
      setStatus('Sending update...');
      const data = {
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
        lastUpdated: serverTimestamp(),
        isSimulated,
        batteryLevel: battery || 'Unknown',
        deviceAgent: navigator.userAgent,
        sendCount: sendCount + 1,
        timestamp: new Date().toISOString()
      };

      const docRef = doc(db, 'artifacts', appId, 'public', 'data', `bag_${bagId}`);
      await setDoc(docRef, data, { merge: true });
      
      setLastSent(new Date());
      setSendCount(prev => prev + 1);
      setStatus('Active & Transmitting');
      setError(null);
    } catch (err: any) {
      console.error('Send error:', err);
      setStatus('Error sending data');
      setError(err.message || 'Unknown error occurred');
    }
  };

  // Location tracking effect
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let watchId: number = 0;

    if (isSimulating) {
      // Simulate movement around a fixed point (e.g., Central Park NY)
      let lat = 40.785091;
      let lng = -73.968285;
      
      intervalId = setInterval(() => {
        // Random walk with controlled step size
        lat += (Math.random() - 0.5) * 0.0015;
        lng += (Math.random() - 0.5) * 0.0015;
        // Keep within reasonable bounds
        lat = Math.max(40.75, Math.min(40.82, lat));
        lng = Math.max(-73.99, Math.min(-73.93, lng));
        sendLocation(lat, lng, true);
      }, 5000);
    } else {
      // Real GPS tracking
      if (!navigator.geolocation) {
        setError("Geolocation not supported on this device");
        setStatus('GPS Not Available');
        return;
      }

      const handlePosition = (pos: GeolocationPosition) => {
        const { latitude, longitude } = pos.coords;
        sendLocation(latitude, longitude);
      };

      const handleError = (err: GeolocationPositionError) => {
        const errorMessages: Record<number, string> = {
          1: 'Location permission denied',
          2: 'Unable to retrieve your location',
          3: 'Location request timeout'
        };
        setError(errorMessages[err.code] || err.message);
        setStatus('GPS Signal Lost');
      };

      // Send immediately
      navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      // Then every 60 seconds
      intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      }, 60000);
    }

    return () => {
      clearInterval(intervalId);
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [bagId, appId, db, isSimulating, battery, sendCount]);

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] bg-gradient-to-br from-slate-800 to-slate-900 text-white ${isMobile ? 'px-4' : 'px-6'}`}>
      <div className={`flex-1 flex flex-col items-center justify-center space-y-6 ${isMobile ? 'py-6' : 'py-12'}`}>
        
        {/* Radar Animation */}
        <div className="relative">
          <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-24 h-24 bg-blue-500/40 rounded-full flex items-center justify-center animate-pulse" style={{animationDelay: '0.2s'}}>
              <div className="w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,1)]"></div>
            </div>
          </div>
          {/* Scanning Line */}
          <div 
            className="absolute top-0 left-0 w-32 h-32 rounded-full border border-blue-500/30 border-t-blue-400" 
            style={{animation: 'spin 3s linear infinite'}}
          ></div>
          <Signal className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-300 animate-pulse" />
        </div>

        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl font-mono font-bold tracking-wider mb-2 text-blue-300">{bagId}</h2>
          <p className="text-slate-400 text-xs uppercase tracking-widest">Tracking ID</p>
          
          <button 
            onClick={copyToClipboard}
            className="mt-4 flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm transition transform hover:scale-105"
          >
            {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copySuccess ? "Copied!" : "Copy ID"}
          </button>
        </div>

        <div className={`bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl w-full ${isMobile ? 'max-w-sm' : 'max-w-sm'} space-y-4 border border-slate-700`}>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 flex items-center gap-2">
                <Signal className="w-4 h-4" />
                Status
              </span>
              <span className={`font-medium px-3 py-1 rounded-full text-xs ${
                status.includes('Error') ? 'bg-red-500/20 text-red-300' : 
                status.includes('Transmitting') ? 'bg-emerald-500/20 text-emerald-300' :
                'bg-yellow-500/20 text-yellow-300'
              }`}>
                {status}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Update Rate</span>
              <span className="text-slate-200">{isSimulating ? '5 sec (Sim)' : '1 min (GPS)'}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Last Update</span>
              <span className="text-slate-200 font-mono">
                {lastSent ? lastSent.toLocaleTimeString() : '--:--:--'}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Sends</span>
              <span className="text-slate-200">{sendCount}</span>
            </div>

            {battery !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Battery
                </span>
                <span className={`font-semibold flex items-center gap-1 ${
                  battery > 20 ? 'text-emerald-400' : 
                  battery > 10 ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {battery}%
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 text-xs p-4 rounded-lg w-full max-w-sm backdrop-blur-sm flex gap-3 items-start">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Location Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="bg-blue-900/50 border border-blue-500/50 text-blue-200 text-xs p-4 rounded-lg w-full max-w-sm backdrop-blur-sm">
          <p>💡 <strong>Keep your device screen ON</strong> for continuous tracking. Enable airplane mode if needed but keep WiFi/GPS active.</p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-slate-900/70 backdrop-blur-md border-t border-slate-700 rounded-t-2xl space-y-4">
        {/* Keep Awake Toggle */}
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={isKeepAwake} 
                onChange={(e) => setIsKeepAwake(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-200">Keep Screen Awake</span>
              <p className="text-xs text-slate-400">Prevents screen lock during tracking</p>
            </div>
          </label>
        </div>

        {/* Simulation Toggle */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={isSimulating} 
                onChange={(e) => setIsSimulating(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-200">Simulation Mode</span>
              <p className="text-xs text-slate-400">Test without moving (5s updates)</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default TrackerScreen;
