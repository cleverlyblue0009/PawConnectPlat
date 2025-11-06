#!/bin/bash

# PawConnect Backend Startup Script for EC2

echo "🐾 Starting PawConnect Backend Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Navigate to project directory
cd /home/ubuntu/pawconnect/backend

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  WARNING: Please edit .env with your actual AWS credentials!"
fi

# Start application with PM2
echo "🚀 Starting PawConnect with PM2..."
pm2 delete pawconnect 2>/dev/null || true
pm2 start src/index.js --name "pawconnect"

# Setup PM2 to start on system boot
pm2 startup
pm2 save

# Show status
pm2 list

echo ""
echo "✅ PawConnect Backend is running!"
echo "📊 View logs with: pm2 logs pawconnect"
echo "🔄 Restart with: pm2 restart pawconnect"
echo "🛑 Stop with: pm2 stop pawconnect"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Edit .env with your AWS credentials"
echo "   2. Configure security groups to allow port 3000"
echo "   3. Set up your DynamoDB tables"
echo "   4. Create your S3 bucket"
