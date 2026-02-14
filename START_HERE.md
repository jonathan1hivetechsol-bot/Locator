# 🚀 Getting Started with BagTrack Live

## What You Have

A complete, production-ready **real-time GPS location tracking app** built with:
- React 19 + TypeScript
- Firebase Backend
- OpenStreetMap
- Tailwind CSS
- Fully responsive design

## ⚡ Quick Setup (3 Easy Steps)

### Step 1: Add Firebase Credentials (2 min)

Create `.env.local` in the root folder with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=1:your_app_id:web:your_web_id
VITE_APP_ID=bagtrack-app-1
```

**Don't have Firebase?** [Create free Firebase project](https://console.firebase.google.com)

### Step 2: Run Dev Server (1 min)

```bash
npm run dev
```

Open http://localhost:5173 in your browser

### Step 3: Test It (2 min)

**Tracker Mode:**
1. Click "I am the Tracker"
2. Copy the generated ID
3. Share with a viewer

**Viewer Mode:**
1. Click "I am the Viewer"
2. Paste the tracker ID
3. See live location on map!

## 📁 Key Files

```
src/
├── App.tsx                 # Main app
├── components/
│   ├── SelectionScreen.tsx # Start screen
│   ├── TrackerScreen.tsx   # GPS tracking
│   └── ViewerScreen.tsx    # Map viewer
└── index.css              # Styles

QUICKSTART.md              # 5-minute setup
DEPLOYMENT.md              # Deployment guide
API_GUIDE.md               # Integration examples
PROJECT_SUMMARY.md         # Full overview
```

## 🎯 Features

✅ Real-time GPS tracking  
✅ Interactive map with Leaflet  
✅ Battery level display  
✅ Simulation mode (test without GPS)  
✅ Keep screen awake feature  
✅ Mobile optimized  
✅ Copy tracking ID to clipboard  
✅ Live updates every 60 seconds  

## 🚀 Deploy (Pick One)

### Vercel (Easiest)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Firebase
```bash
firebase deploy --only hosting
```

### Docker
```bash
docker build -t bagtrack .
docker run -p 3000:3000 bagtrack
```

All take about 5 minutes!

## 🔒 Firebase Setup (Important!)

1. Create Firestore Database
2. Enable Anonymous Auth
3. Set these security rules:

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

## 📱 Mobile Testing

Use ngrok to test on real phone:

```bash
# Terminal 1
npm run dev

# Terminal 2
npx ngrok http 5173
```

Share ngrok URL with your phone!

## 🐛 Troubleshooting

**GPS says "Not Available"**  
→ GPS needs HTTPS or localhost. Use simulation mode or deploy.

**Firebase Error**  
→ Check .env.local has correct credentials

**Map not showing**  
→ Wait 5 seconds, it loads from CDN

**Location permission denied**  
→ Allow in browser settings

## 💡 Next Steps

1. ✅ Setup Firebase (get credentials)
2. ✅ Create .env.local file
3. ✅ Run `npm run dev`
4. ✅ Test locally
5. ✅ Deploy to production
6. ✅ Share with friends!

## 📚 Documentation

- **README.md** - Full documentation
- **QUICKSTART.md** - 5-minute guide
- **DEPLOYMENT.md** - Deploy anywhere
- **API_GUIDE.md** - Extend the app
- **PROJECT_SUMMARY.md** - Complete overview
- **CHECKLIST.md** - Pre-deployment checklist

## 🎁 Bonus Tips

- Use "Simulation Mode" to test without GPS
- Enable "Keep Screen Awake" for continuous tracking
- Copy tracking ID for easy sharing
- Check battery level on tracker screen
- Test on mobile before deploying

## ❓ Need Help?

1. Check QUICKSTART.md
2. Read DEPLOYMENT.md for your platform
3. See API_GUIDE.md for integration examples
4. Review troubleshooting in README.md

## 🎉 You're Ready!

Everything is set up and ready to go:

✅ Code built and tested  
✅ All dependencies installed  
✅ Production optimized  
✅ Fully documented  
✅ Ready to deploy  

**Start with:** Add Firebase credentials to `.env.local` then `npm run dev`

---

**Made with ❤️ - Enjoy tracking!** 📍
