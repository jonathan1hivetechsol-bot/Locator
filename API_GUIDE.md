# BagTrack Live - API & Integration Guide

## Firebase Firestore Data Model

### Collection Structure
```
artifacts/
├── {appId}/
│   └── public/
│       └── data/
│           └── bag_{bagId}/
│               ├── lat: number
│               ├── lng: number
│               ├── lastUpdated: Timestamp
│               ├── isSimulated: boolean
│               ├── batteryLevel: number | string
│               ├── deviceAgent: string
│               ├── sendCount: number
│               └── timestamp: string
```

## REST API Examples

### Get Location
```bash
curl "https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/artifacts/{APP_ID}/public/data/bag_{BAG_ID}" \
  -H "Authorization: Bearer {ID_TOKEN}"
```

### Update Location (Tracker)
```bash
curl -X PATCH \
  "https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/artifacts/{APP_ID}/public/data/bag_{BAG_ID}" \
  -H "Authorization: Bearer {ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "lat": {"doubleValue": 40.7128},
      "lng": {"doubleValue": -74.0060},
      "lastUpdated": {"timestampValue": "2024-02-14T12:00:00Z"}
    }
  }'
```

## JavaScript/SDK Integration

### Initialize App
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

### Subscribe to Real-time Updates
```typescript
const bagId = "K9P2X5";
const appId = "bagtrack-app-1";

const unsubscribe = onSnapshot(
  doc(db, 'artifacts', appId, 'public', 'data', `bag_${bagId}`),
  (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Location:', data.lat, data.lng);
      console.log('Battery:', data.batteryLevel);
      console.log('Last Updated:', data.lastUpdated.toDate());
    }
  }
);

// Stop listening
unsubscribe();
```

### Send Location (Tracker)
```typescript
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';

async function sendLocation(lat, lng) {
  const bagId = "K9P2X5";
  const appId = "bagtrack-app-1";
  
  const docRef = doc(db, 'artifacts', appId, 'public', 'data', `bag_${bagId}`);
  
  await setDoc(docRef, {
    lat: lat,
    lng: lng,
    lastUpdated: serverTimestamp(),
    batteryLevel: navigator.getBattery ? 85 : 'Unknown',
    deviceAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }, { merge: true });
}
```

## Component Integration Examples

### Integrate Tracker into Existing App
```typescript
import TrackerScreen from './components/TrackerScreen';
import { getFirestore } from 'firebase/firestore';

function MyApp() {
  const db = getFirestore();
  
  return (
    <TrackerScreen
      bagId="K9P2X5"
      appId="my-app"
      db={db}
      auth={auth}
      copyToClipboard={() => navigator.clipboard.writeText("K9P2X5")}
      copySuccess={false}
      isMobile={true}
    />
  );
}
```

### Integrate Viewer into Existing App
```typescript
import ViewerScreen from './components/ViewerScreen';

function MyViewer() {
  const db = getFirestore();
  const user = { uid: "user123", isAnonymous: true };
  
  return (
    <ViewerScreen
      bagId="K9P2X5"
      appId="my-app"
      db={db}
      user={user}
      isMobile={false}
    />
  );
}
```

## Extending the App

### Add Database Query
```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';

async function getAllBags(appId) {
  const q = query(
    collection(db, 'artifacts', appId, 'public', 'data'),
    where('isSimulated', '==', false)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

### Add Cloud Function for Cleanup
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.cleanupOldLocations = functions.pubsub
  .schedule('every 30 days')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const snapshot = await db.collectionGroup('data')
      .where('lastUpdated', '<', thirtyDaysAgo)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    await batch.commit();
    console.log(`Deleted ${snapshot.size} old location entries`);
  });
```

### Add Notification on Location Update
```typescript
async function notifyOnLocationUpdate(bagId, appId) {
  const docRef = doc(db, 'artifacts', appId, 'public', 'data', `bag_${bagId}`);
  
  onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      // Show notification
      new Notification('Bag Location Updated', {
        body: `Last seen at ${doc.data().lastUpdated.toDate().toLocaleTimeString()}`,
        icon: '📍'
      });
    }
  });
}
```

## Custom Hook Example

```typescript
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

export function useTrackerLocation(db, appId, bagId) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', `bag_${bagId}`);
    
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setLocation(doc.data());
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, appId, bagId]);

  return { location, loading, error };
}

// Usage
function MyComponent() {
  const { location, loading, error } = useTrackerLocation(db, appId, bagId);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <p>Lat: {location?.lat}</p>
      <p>Lng: {location?.lng}</p>
    </div>
  );
}
```

## Webhooks Integration

### Google Cloud Functions Webhook
```javascript
// Deploy with: gcloud functions deploy bagtrack-webhook

exports.webhookHandler = async (req, res) => {
  const { bagId, appId } = req.body;
  
  try {
    const docRef = admin.firestore().doc(
      `artifacts/${appId}/public/data/bag_${bagId}`
    );
    
    const doc = await docRef.get();
    
    if (doc.exists()) {
      // Send to external webhook
      await fetch('https://your-webhook.com/location', {
        method: 'POST',
        body: JSON.stringify({
          bagId,
          location: doc.data()
        })
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## TypeScript Interfaces

```typescript
interface BagLocation {
  lat: number;
  lng: number;
  lastUpdated: Date;
  isSimulated: boolean;
  batteryLevel: number | string;
  deviceAgent: string;
  sendCount: number;
  timestamp: string;
}

interface TrackerUser {
  uid: string;
  isAnonymous: boolean;
}

interface TrackerScreenProps {
  bagId: string;
  appId: string;
  db: Firestore;
  auth: Auth;
  copyToClipboard: () => void;
  copySuccess: boolean;
  isMobile: boolean;
}

interface ViewerScreenProps {
  bagId: string;
  appId: string;
  db: Firestore;
  user: TrackerUser;
  isMobile: boolean;
}
```

## Error Handling Best Practices

```typescript
try {
  await sendLocation(lat, lng);
} catch (error) {
  if (error.code === 'permission-denied') {
    console.error('Check Firestore rules');
  } else if (error.code === 'unauthenticated') {
    console.error('User not authenticated');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Performance Tips

1. **Use serverTimestamp()** instead of client time
2. **Batch updates** when possible
3. **Limit listening** to only needed fields
4. **Index queries** for better performance
5. **Archive old data** regularly
6. **Use composite keys** for bag identification
7. **Cache location** locally before sending

## Security Best Practices

1. ✅ Always use authentication (Firebase Auth)
2. ✅ Validate Firestore security rules
3. ✅ Never expose API keys in frontend code
4. ✅ Use HTTPS in production
5. ✅ Rate limit API calls
6. ✅ Sanitize input data
7. ✅ Set data retention policies

---

**Need help?** Check the [deployment guide](DEPLOYMENT.md) or [quick start](QUICKSTART.md)
