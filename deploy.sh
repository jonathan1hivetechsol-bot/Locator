#!/bin/bash

# BagTrack Live - Deployment Script

set -e

echo "🚀 BagTrack Live Deployment Script"
echo "===================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Create .env.local with your Firebase credentials"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Error: Node.js 16+ required (you have $NODE_VERSION)"
    exit 1
fi

echo "✅ Prerequisites checked"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Linting code..."
npm run lint || echo "⚠️  Lint warnings (non-critical)"

# Build
echo "🔨 Building for production..."
npm run build

if [ -d "dist" ]; then
    SIZE=$(du -sh dist | cut -f1)
    echo "✅ Build successful! Size: $SIZE"
else
    echo "❌ Build failed!"
    exit 1
fi

# Ask for deployment method
echo ""
echo "Choose deployment method:"
echo "1) Vercel"
echo "2) Netlify"
echo "3) Firebase Hosting"
echo "4) Docker"
echo "5) Manual (dist folder ready)"
read -p "Enter choice (1-5): " CHOICE

case $CHOICE in
    1)
        echo "🚀 Deploying to Vercel..."
        npx vercel --prod
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        npx netlify deploy --prod --dir=dist
        ;;
    3)
        echo "🚀 Deploying to Firebase..."
        npx firebase deploy --only hosting
        ;;
    4)
        echo "🐳 Building Docker image..."
        docker build -t bagtrack:latest .
        echo "✅ Docker image built!"
        echo "Run with: docker run -p 5173:5173 bagtrack:latest"
        ;;
    5)
        echo "✅ dist/ folder is ready!"
        echo "Upload to your hosting provider"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo "✅ Deployment complete!"
echo "Visit your app URL to verify"
