# Deployment Guide - BagTrack Live

## Prerequisites
- Node.js 16+ installed
- Git configured
- Firebase project created
- Domain/hosting account

## Step 1: Firebase Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database
4. Set security rules:

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

### 1.2 Enable Authentication
1. Go to Authentication > Sign-in method
2. Enable "Anonymous" authentication

### 1.3 Get Firebase Config
1. Go to Project Settings
2. Copy Web API credentials
3. Create `.env.local`:

```env
VITE_FIREBASE_API_KEY=xxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx
VITE_FIREBASE_APP_ID=1:xxxxx:web:xxxxx
VITE_APP_ID=bagtrack-app-1
```

## Step 2: Local Testing

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Test tracker and viewer modes
# Visit http://localhost:5173
```

## Step 3: Build for Production

```bash
# Create production build
npm run build

# Test production build locally
npm run preview
```

## Step 4: Deploy Options

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

**Environment variables in Vercel:**
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_APP_ID

### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  VITE_FIREBASE_API_KEY = "xxxxx"
  # ... other env vars
```

### Option C: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy --only hosting
```

Configure `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=3600"
          }
        ]
      }
    ]
  }
}
```

### Option D: Docker + Cloud Run

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["npm", "run", "preview"]
```

Deploy:
```bash
docker build -t bagtrack .
docker push gcr.io/your-project/bagtrack
gcloud run deploy bagtrack --image gcr.io/your-project/bagtrack
```

### Option E: Traditional VPS

```bash
# Build on your machine
npm run build

# Transfer dist/ folder to server
scp -r dist/* user@server:/var/www/bagtrack

# On server, serve with Nginx
```

Nginx config:
```nginx
server {
  listen 80;
  server_name bagtrack.yourdomain.com;
  
  root /var/www/bagtrack;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  # Cache static assets
  location /assets {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

Enable HTTPS with Let's Encrypt:
```bash
certbot --nginx -d bagtrack.yourdomain.com
```

## Step 5: Post-Deployment

### 5.1 Test Deployment
- Visit your live URL
- Test tracker mode (send location)
- Test viewer mode (receive location)
- Test on mobile devices
- Verify GPS functionality

### 5.2 Setup Custom Domain
1. Update domain DNS settings
2. Point to your hosting provider
3. Wait for DNS propagation (5-15 min)

### 5.3 Enable HTTPS
- Vercel: Automatic
- Netlify: Automatic
- Firebase: Automatic
- Others: Use Let's Encrypt

### 5.4 Performance Optimization
```bash
# Check bundle size
npm run build -- --analyze

# Monitor performance
# Use Lighthouse in Chrome DevTools
# Target: 90+ scores
```

### 5.5 Setup Monitoring
- Enable Firebase Analytics
- Setup error tracking (Sentry)
- Monitor uptime
- Check logs regularly

## Step 6: Maintenance

### Regular Tasks
```bash
# Update dependencies monthly
npm update

# Security audit
npm audit

# Check for vulnerabilities
npm audit fix

# Rebuild and deploy
npm run build
# Deploy using your chosen method
```

### Database Cleanup
```javascript
// Firebase Cloud Function to clean old data
const admin = require('firebase-admin');
const db = admin.firestore();

exports.cleanupOldData = functions.pubsub
  .schedule('every 30 days')
  .onRun(async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const query = db.collection('artifacts')
      .where('lastUpdated', '<', thirtyDaysAgo);
    
    const snapshot = await query.get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  });
```

## Troubleshooting Deployment

### Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working
- Check `.env.local` (local only, won't deploy)
- Add to hosting platform's env var section
- Restart deployment after setting vars

### Firebase Not Connecting
- Verify credentials in `.env`
- Check Firestore rules
- Check Firebase quota
- Look for CORS errors in browser console

### Performance Issues
- Reduce map zoom level delay
- Lazy load non-critical components
- Enable gzip compression on server
- Use CDN for static assets

## Production Checklist

- [ ] Firebase project created and configured
- [ ] Firestore security rules set
- [ ] Anonymous auth enabled
- [ ] Environment variables configured
- [ ] Build tested locally
- [ ] Production build created
- [ ] Deployed to hosting
- [ ] Custom domain configured
- [ ] HTTPS enabled
- [ ] GPS tested on mobile
- [ ] Map loading verified
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Monitoring enabled
- [ ] Backup strategy planned

## Support & Help

For issues:
1. Check browser console for errors
2. Check Firebase console logs
3. Verify network connectivity
4. Test with different browser
5. Check deployment provider logs
