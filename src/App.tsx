import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  MapPin, 
  Home,
  Signal
} from 'lucide-react';

import TrackerScreen from './components/TrackerScreen';
import ViewerScreen from './components/ViewerScreen';
import SelectionScreen from './components/SelectionScreen';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKey",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bagttrack-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bagtrack-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bagtrack-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = import.meta.env.VITE_APP_ID || 'bagtrack-app-1';

export type AppMode = 'selection' | 'tracker' | 'viewer';

interface User {
  uid: string;
  isAnonymous: boolean;
}

const BagTrackerApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<AppMode>('selection');
  const [bagId, setBagId] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // --- Auth Initialization ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        const customToken = import.meta.env.VITE_CUSTOM_AUTH_TOKEN;
        if (customToken) {
          await signInWithCustomToken(auth, customToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Auth error:', error);
        // Retry anonymous login
        await signInAnonymously(auth);
      }
    };
    
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser({
          uid: authUser.uid,
          isAnonymous: authUser.isAnonymous
        });
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Helper: Generate Random ID ---
  const generateId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setBagId(randomId);
  };

  // --- Helper: Copy to Clipboard ---
  const copyToClipboard = () => {
    if (!bagId) return;
    
    // Try modern API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(bagId).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }).catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = bagId;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
    document.body.removeChild(textArea);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white/30 rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
            <Signal className="absolute inset-0 m-auto w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">BagTrack Live</p>
            <p className="text-sm text-blue-100">Connecting to satellite...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 font-sans text-slate-800 ${isMobile ? 'pb-safe' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg">BagTrack Live</h1>
              <p className="text-xs text-blue-100">Real-time Location Tracking</p>
            </div>
          </div>
          {mode !== 'selection' && (
            <button 
              onClick={() => {
                setMode('selection');
                setBagId('');
              }}
              className="flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition backdrop-blur-sm"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
          )}
        </div>
      </header>

      <main className={`flex-1 ${isMobile ? 'w-full' : 'max-w-6xl mx-auto'}`}>
        {/* MODE SELECTION SCREEN */}
        {mode === 'selection' && (
          <SelectionScreen 
            onTrackerMode={() => {
              generateId();
              setMode('tracker');
            }}
            onViewerMode={() => setMode('viewer')}
            bagId={bagId}
            setBagId={setBagId}
            isMobile={isMobile}
          />
        )}

        {/* TRACKER MODE */}
        {mode === 'tracker' && (
          <TrackerScreen 
            bagId={bagId} 
            appId={appId} 
            db={db} 
            auth={auth}
            copyToClipboard={copyToClipboard}
            copySuccess={copySuccess}
            isMobile={isMobile}
          />
        )}

        {/* VIEWER MODE */}
        {mode === 'viewer' && (
          <ViewerScreen 
            bagId={bagId} 
            appId={appId} 
            db={db} 
            user={user}
            isMobile={isMobile}
          />
        )}
      </main>

      {/* Footer - Mobile Safe Area */}
      {isMobile && mode !== 'viewer' && (
        <div className="h-4 bg-slate-50"></div>
      )}
    </div>
  );
};

export default BagTrackerApp;
