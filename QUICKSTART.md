# Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Setup Firebase (2 min)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Get your Web SDK config
4. Create `.env.local`:

```env
VITE_FIREBASE_API_KEY=xxxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx
VITE_FIREBASE_APP_ID=1:xxxxx:web:xxxxx
```

### Step 3: Run Locally (2 min)
```bash
npm run dev
```

Visit `http://localhost:5173`

## 🎯 Test It Out

### Test Tracker Mode
1. Click "I am the Tracker"
2. ID is auto-generated (e.g., "K9P2X5")
3. Click "Copy ID"
4. Open new tab or device

### Test Viewer Mode
1. In new tab, click "I am the Viewer"
2. Paste the tracking ID
3. Click "Track"
4. You should see the map!

### Simulation Mode (No GPS needed)
1. In tracker tab, toggle "Simulation Mode ON"
2. Tracker will send fake GPS data every 5 seconds
3. Check viewer tab - location updates in real-time

## 📱 Mobile Testing

### Use ngrok for Mobile Testing
```bash
# Terminal 1: Start local dev
npm run dev

# Terminal 2: Expose local to internet
npx ngrok http 5173

# Share ngrok URL with mobile device
https://xxxx-xx-xxx-xxx-xx.ngrok.io
```

### Test on Real Mobile Phone
1. Enable GPS on phone
2. Go to tracker mode
3. Copy ID
4. Ask someone to open viewer mode and track you
5. Walk around to see live updates!

## 🚀 Deploy (5 minutes)

### Option 1: Vercel (Easiest)
```bash
npm run build
vercel --prod
```
Set env vars in Vercel dashboard, done!

### Option 2: Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## 📝 Required Firebase Rules

Paste this in Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎨 Customization

### Change App Name
Edit [src/App.tsx](src/App.tsx#L14)

### Change Colors
Edit [tailwind.config.js](tailwind.config.js#L6)

### Change Update Interval
Edit [src/components/TrackerScreen.tsx](src/components/TrackerScreen.tsx#L157) (default: 60000ms = 1 minute)

## 🆘 Troubleshooting

### "GPS not available"
- GPS needs HTTPS in production
- Use simulation mode for testing
- Check permissions on device

### "Firebase error"
- Verify `.env.local` has correct values
- Check Firestore rules are set
- Ensure anonymous auth is enabled

### "Map not showing"
- Leaflet CDN might not load instantly
- Wait 5 seconds
- Try hard refresh (Ctrl+Shift+R)

## 📊 Features Included

✅ Real-time GPS tracking  
✅ Interactive OpenStreetMap  
✅ Battery level display  
✅ Simulation mode for testing  
✅ Keep-screen-awake feature  
✅ Mobile responsive  
✅ Dark mode tracking screen  
✅ Copy to clipboard  
✅ Live updates every 60 seconds  

## 🔒 Security Note

- No personal data stored permanently
- Only location is saved (can be deleted anytime)
- Uses Firebase Anonymous Auth
- Secure Firestore rules prevent unauthorized access

## 📚 Learn More

- [React Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Docs](https://vite.dev)
- [Tailwind Docs](https://tailwindcss.com)

---

**Ready to track? Start with `npm run dev` now!** 🚀
