# 🔧 Commands Reference

## 📦 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting check
npm run lint
```

## 🚀 Deployment Commands

### Vercel (Recommended)
```bash
# Global install (one time)
npm install -g vercel

# Deploy to production
npm run build
vercel --prod

# With environment variables
vercel --prod --env VITE_FIREBASE_API_KEY=xxxxx
```

### Netlify
```bash
# Global install (one time)
npm install -g netlify-cli

# Deploy to production
npm run build
netlify deploy --prod --dir=dist
```

### Firebase
```bash
# Global install (one time)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Deploy
npm run build
firebase deploy --only hosting
```

### Docker
```bash
# Build Docker image
docker build -t bagtrack:latest .

# Run Docker container
docker run -p 3000:3000 bagtrack:latest

# With environment variables
docker run -p 3000:3000 \
  -e VITE_FIREBASE_API_KEY=xxxxx \
  -e VITE_FIREBASE_PROJECT_ID=xxxxx \
  bagtrack:latest

# Using Docker Compose
docker-compose up -d
docker-compose down
```

## 📦 NPM Package Management

```bash
# Install all dependencies
npm install

# Install new package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix security vulnerabilities
npm audit fix

# Check outdated packages
npm outdated
```

## 🔍 Testing & Debugging

```bash
# Run linting
npm run lint

# TypeScript type check
npx tsc --noEmit

# Build and check
npm run build

# Preview production
npm run preview

# Check bundle size
npm run build -- --analyze
```

## 🌐 Local Network Testing

```bash
# Using ngrok (expose local to internet)
npx ngrok http 5173

# Using serve (simple HTTP server)
npx serve -s dist -l 3000

# Python simple server
python -m http.server 8000

# Node.js http-server
npx http-server dist -p 3000
```

## 🔐 Environment Setup

```bash
# Create .env.local
cp .env.example .env.local

# Edit with your credentials
nano .env.local
# or
code .env.local

# Verify it's in .gitignore (don't commit!)
cat .gitignore | grep ".env"
```

## 📊 Monitoring & Logs

```bash
# View npm logs
npm logs

# View build output
npm run build 2>&1 | tee build.log

# Check deployment logs
# Vercel
vercel logs

# Netlify
netlify logs:functions

# Firebase
firebase functions:log
```

## 🛠️ Maintenance Commands

```bash
# Clean install (remove node_modules and reinstall)
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force

# Update Node.js
nvm install node
nvm use node

# Check Node version
node --version
npm --version
```

## 🚀 CI/CD Commands (GitHub Actions)

```bash
# Test locally with act
act -j build

# View workflow logs
cat .github/workflows/deploy.yml
```

## 📱 Mobile Testing

```bash
# Expose local dev to phone
npx ngrok http 5173

# Share the https://xxxx.ngrok.io URL with your phone

# Or use QR code generator
# Works with most ngrok plans
```

## 🔄 Git Commands

```bash
# Initialize repo
git init

# Add files
git add .

# Commit
git commit -m "Deploy message"

# Push to GitHub
git push origin main

# Check status
git status

# View logs
git log --oneline
```

## 📝 File Management

```bash
# Create .env.local from template
cp .env.example .env.local

# Create backup
cp -r .env.local .env.local.backup

# Delete build
rm -rf dist

# Clear all build artifacts
rm -rf dist node_modules

# Create production snapshot
npm run build && tar -czf bagtrack-$(date +%s).tar.gz dist/
```

## 🐳 Docker Compose

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild image
docker-compose up --build

# Remove everything
docker-compose down -v
```

## 🔒 Security Commands

```bash
# Check for vulnerabilities
npm audit

# Fix security issues
npm audit fix

# Fix with force
npm audit fix --force

# Check package integrity
npm verify

# Generate SBOM (Software Bill of Materials)
npm sbom
```

## 📦 Build Size Analysis

```bash
# Analyze bundle
npm run build -- --analyze

# Check gzip size
npm run build 2>&1 | grep "gzip"

# List all files
ls -lh dist/assets/
```

## 🚀 Quick Deploy

```bash
# One-liner for Vercel
npm run build && vercel --prod

# One-liner for Netlify
npm run build && netlify deploy --prod --dir=dist

# One-liner for Firebase
npm run build && firebase deploy --only hosting
```

## 📞 Help Commands

```bash
# Get npm help
npm help

# Get help for specific command
npm help run
npm help install

# Get Vite help
npx vite --help

# Get TypeScript help
npx tsc --help
```

## 🎯 Common Workflows

### Local Development
```bash
npm run dev
# Edit files, auto-reload happens
```

### Before Committing
```bash
npm run lint
npm run build
# Check git status
git status
```

### Deploying to Production
```bash
# Update code
git add .
git commit -m "Feature: add new capability"
git push

# Then pick one deployment method:
# 1. Vercel: vercel --prod
# 2. Netlify: netlify deploy --prod --dir=dist
# 3. Firebase: firebase deploy --only hosting
```

### Emergency Rollback
```bash
# View previous commits
git log --oneline

# Revert to previous commit
git revert <commit-hash>
git push

# Or reset (careful!)
git reset --hard <commit-hash>
```

---

## 🆘 Troubleshooting Commands

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if ports are in use
lsof -i :5173  # Linux/Mac
netstat -ano | findstr :5173  # Windows

# Kill process on port
kill -9 $(lsof -t -i :5173)  # Linux/Mac
taskkill /PID <PID> /F  # Windows

# Check environment
npm run build -- --no-cache
```

---

## 📚 Additional Resources

- **NPM Docs:** https://docs.npmjs.com
- **Vite Docs:** https://vite.dev/guide/cli.html
- **Docker Docs:** https://docs.docker.com
- **Firebase CLI:** https://firebase.google.com/docs/cli

---

**Save this file for quick reference!** 📌
