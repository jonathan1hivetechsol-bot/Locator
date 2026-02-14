import React from 'react';
import { 
  Smartphone, 
  Eye, 
  AlertTriangle,
  ArrowRight,
  Zap
} from 'lucide-react';

interface SelectionScreenProps {
  onTrackerMode: () => void;
  onViewerMode: () => void;
  bagId: string;
  setBagId: (id: string) => void;
  isMobile: boolean;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({
  onTrackerMode,
  onViewerMode,
  bagId,
  setBagId,
  isMobile
}) => {
  return (
    <div className={`min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 to-slate-100 ${isMobile ? 'px-4 py-6' : 'px-6 py-12'} flex flex-col`}>
      <div className={`max-w-2xl mx-auto w-full ${isMobile ? '' : 'flex flex-col items-center'}`}>
        
        {/* Header */}
        <div className={`text-center mb-8 ${isMobile ? '' : 'mb-12'}`}>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Locate Your Stuff</h2>
          <p className="text-slate-500 text-sm sm:text-base">Real-time location tracking for bags, luggage, and valuables</p>
        </div>

        {/* Mode Selection Cards */}
        <div className={`space-y-4 mb-8 w-full ${isMobile ? '' : 'max-w-md'}`}>
          
          {/* Tracker Card */}
          <button 
            onClick={onTrackerMode}
            className="w-full bg-white p-6 rounded-2xl shadow-md border-2 border-transparent hover:border-blue-400 hover:shadow-lg transition-all transform hover:scale-105 text-left group"
          >
            <div className="flex items-start gap-4 mb-3">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-xl group-hover:scale-110 group-hover:shadow-lg transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800">I am the Tracker</h3>
                <p className="text-xs text-slate-500 mt-1">Put this device in the bag to track it</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg flex gap-2 text-xs text-blue-700">
              <Zap className="w-4 h-4 shrink-0" />
              <span>Sends your location every 60 seconds</span>
            </div>
          </button>

          {/* Viewer Card */}
          <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-slate-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-xl">
                <Eye className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800">I am the Viewer</h3>
                <p className="text-xs text-slate-500 mt-1">Track a bag from another device</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Bag ID (e.g., X7K9P)" 
                  value={bagId}
                  onChange={(e) => setBagId(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase tracking-widest font-mono transition"
                  maxLength={6}
                />
                <button 
                  disabled={bagId.length < 3}
                  onClick={onViewerMode}
                  className="bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  Track
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Get the tracking ID from the device in the bag
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className={`space-y-3 w-full ${isMobile ? '' : 'max-w-md'}`}>
          
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-amber-900 font-semibold mb-1">Screen Needs to Stay On</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                The device in the bag should keep its screen awake or plugged in. We'll provide a screen lock option in tracker mode.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex gap-3 items-start">
            <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-blue-900 font-semibold mb-1">Uses GPS and WiFi</p>
              <p className="text-xs text-blue-800 leading-relaxed">
                Location accuracy depends on available GPS signal. WiFi can help indoors. Real-time updates every minute.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex gap-3 items-start">
            <Eye className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-emerald-900 font-semibold mb-1">Your Privacy Matters</p>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Location data is encrypted and only visible to devices with the correct tracking ID.
              </p>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className={`mt-8 grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4 w-full text-center text-sm`}>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-slate-600">✨ <strong>Live Updates</strong></p>
            <p className="text-xs text-slate-500 mt-1">Real-time location tracking</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-slate-600">🗺️ <strong>Map View</strong></p>
            <p className="text-xs text-slate-500 mt-1">See location on OpenStreetMap</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-slate-600">🔋 <strong>Battery Info</strong></p>
            <p className="text-xs text-slate-500 mt-1">Monitor device battery level</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionScreen;
