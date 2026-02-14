# BagTrack Live - Real-time Location Tracking App

A modern, responsive web application for real-time location tracking of bags, luggage, and valuables using Firebase and React.

## 🚀 Features

- **Real-time GPS Tracking**: Track device location every 60 seconds
- **Dual Mode Operation**: Tracker (sends location) & Viewer (receives location)
- **Live Map Display**: OpenStreetMap integration with Leaflet
- **Battery Monitoring**: Display device battery level
- **Mobile Optimized**: Fully responsive design for mobile and desktop
- **Simulation Mode**: Test tracking without moving
- **Screen Keep-Awake**: Native wake lock API support
- **Copy-to-Clipboard**: Easy sharing of tracking IDs
- **Real-time Updates**: Firebase Firestore subscriptions

## 📋 Prerequisites

- Node.js 16+ and npm
- Firebase account with Firestore database
- Modern browser with GPS support

## 🔧 Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

Create a `.env.local` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_APP_ID=bagtrack-app-1
```

### 3. Firestore Rules

Set up your Firestore security rules:

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

## 🏃 Running

### Development

```bash
npm run dev
```

Starts dev server at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Creates optimized build in `dist/` directory

### Preview Build

```bash
npm run preview
```

Preview production build locally

## 📱 Usage

### Tracker Mode
1. Click "I am the Tracker"
2. A unique tracking ID is generated
3. Copy and share the ID with viewers
4. Device continuously sends GPS location every 60 seconds
5. Optional: Enable Simulation Mode for testing
6. Optional: Enable Keep Screen Awake to prevent screen lock

### Viewer Mode
1. Click "I am the Viewer"
2. Enter the 6-character tracking ID
3. Click "Track"
4. View real-time location on interactive map
5. See last update time, battery level, and coordinates

## 🏗️ Project Structure

```
src/
├── App.tsx                 # Main application component
├── components/
│   ├── TrackerScreen.tsx   # GPS tracking & sending
│   ├── ViewerScreen.tsx    # Map viewing & receiving
│   └── SelectionScreen.tsx # Mode selection UI
├── index.css              # Tailwind + custom styles
└── main.tsx               # React entry point
```

## 🔑 Key Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Firebase** - Backend (Auth + Firestore)
- **Leaflet** - Map rendering
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## 📊 Data Structure

Tracking data stored in Firestore:

```typescript
{
  lat: number;              // Latitude
  lng: number;              // Longitude
  lastUpdated: timestamp;   // Server timestamp
  isSimulated: boolean;     // Simulation flag
  batteryLevel: number;     // Device battery %
  deviceAgent: string;      // User agent
  sendCount: number;        // Total updates sent
  timestamp: string;        // ISO timestamp
}
```

## 🚀 Deployment

### Vercel

```bash
vercel
```

### Netlify

```bash
netlify deploy --prod --dir=dist
```

### Firebase Hosting

```bash
firebase deploy
```

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["npm", "run", "preview"]
```

Build and run:

```bash
docker build -t bagtrack .
docker run -p 5173:5173 bagtrack
```

## 📱 Mobile Optimization

- Responsive design (mobile-first)
- Safe area support for notched phones
- Touch-friendly buttons and inputs
- Optimized for low bandwidth
- Progressive enhancement

## 🔐 Security

- Anonymous Firebase authentication
- Optional custom token support
- Firestore security rules enforcement
- HTTPS required for production
- No sensitive data stored locally

## ⚙️ Performance

- Code splitting (Firebase, Leaflet as chunks)
- Lazy loading of map library
- Minified production build
- Service worker ready
- Optimized bundle size (~150KB gzipped)

## 🐛 Troubleshooting

### GPS Not Working
- Check location permissions
- Enable GPS on device
- Ensure high accuracy mode if available
- Check for GPS signal (works better outdoors)

### Map Not Showing
- Wait for Leaflet CDN to load
- Check browser console for errors
- Ensure JavaScript is enabled
- Try different browser

### Firebase Connection Issues
- Verify Firebase credentials
- Check Firestore rules
- Ensure network connection
- Check Firebase quota limits

### Battery API Not Available
- Battery Status API is not supported on all browsers
- Falls back gracefully without error

## 📝 Browser Support

| Browser | Support |
|---------|---------|
| Chrome/Edge | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Mobile Safari | ✅ Full |
| Android Chrome | ✅ Full |

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Contributing

Pull requests welcome! Please follow the existing code style.

## 📞 Support

For issues and feature requests, please create an issue on GitHub.

---

**Made with ❤️ for tracking what matters**
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
