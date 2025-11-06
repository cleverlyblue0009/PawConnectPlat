#!/bin/bash

# PawConnect Backend Deployment Script for EC2

echo "🐾 ========================================="
echo "🐾 PawConnect Backend Deployment"
echo "🐾 ========================================="

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "⚠️  Please don't run as root"
   exit 1
fi

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest code from git..."
    git pull origin main || echo "⚠️  Git pull failed or not configured"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your actual credentials before starting the server!"
    exit 1
fi

# Restart with PM2
echo "🔄 Restarting server with PM2..."
pm2 restart pawconnect 2>/dev/null || pm2 start src/index.js --name "pawconnect"

# Save PM2 configuration
pm2 save

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
pm2 status
echo ""
echo "📊 View logs: pm2 logs pawconnect"
echo "🔄 Restart: pm2 restart pawconnect"
echo "🛑 Stop: pm2 stop pawconnect"
echo "📈 Monitor: pm2 monit"
echo ""
echo "🐾 ========================================="
