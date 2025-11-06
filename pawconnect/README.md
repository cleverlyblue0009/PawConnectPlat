# 🐾 PawConnect - Pet Adoption Platform

**Connecting Hearts, One Paw at a Time**

PawConnect is a full-stack pet adoption platform that connects loving families with pets in need of homes. Built with React, Node.js/Express, AWS DynamoDB, and AWS S3.

![Tech Stack](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![AWS](https://img.shields.io/badge/AWS-DynamoDB%20%7C%20S3-orange)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [AWS Setup](#aws-setup)
- [EC2 Deployment](#ec2-deployment)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### For Adopters
- 🔍 Browse thousands of adoptable pets with advanced filters
- ❤️ Save favorite pets
- 📝 Submit adoption applications online
- 📊 Track application status in dashboard
- 🔔 Get notifications on application updates

### For Shelters
- 📋 Manage pet listings
- 📬 Review and manage adoption applications
- 📈 View shelter statistics
- ✅ Update pet adoption status

### Core Features
- 🔐 User authentication (adopters & shelters)
- 🖼️ Image upload and management (AWS S3)
- 🔎 Advanced search and filtering
- 📱 Fully responsive design
- 🎨 Beautiful UI with Tailwind CSS
- ⚡ Fast performance with Vite

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI library
- **React Router 6** - Routing
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js 18+** - Runtime
- **Express 4.18** - Web framework
- **AWS SDK v3** - AWS services
- **Bcrypt** - Password hashing
- **Multer** - File uploads

### Database & Storage
- **AWS DynamoDB** - NoSQL database
- **AWS S3** - Image storage

### Deployment
- **AWS EC2** - Backend hosting
- **PM2** - Process management
- **AWS S3/CloudFront** - Frontend hosting (optional)

---

## 📁 Project Structure

```
pawconnect/
├── backend/
│   ├── src/
│   │   ├── config/          # AWS configuration
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   └── index.js         # Entry point
│   ├── .env.example
│   ├── package.json
│   ├── startup.sh           # First-time setup script
│   └── deploy.sh            # Deployment script
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   ├── styles/          # CSS files
│   │   ├── App.jsx          # Main app component
│   │   └── index.jsx        # Entry point
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js 18+** and npm
- **AWS Account** with access to:
  - DynamoDB
  - S3
  - IAM
  - EC2 (for deployment)
- **Git** (optional)

---

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd pawconnect
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your AWS credentials
nano .env
```

Required environment variables in `.env`:
```env
NODE_ENV=development
PORT=3000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DYNAMODB_USERS_TABLE=PawConnect-Users
DYNAMODB_PETS_TABLE=PawConnect-Pets
DYNAMODB_APPLICATIONS_TABLE=PawConnect-Applications
DYNAMODB_FAVORITES_TABLE=PawConnect-Favorites
S3_BUCKET_NAME=your-bucket-name
CORS_ORIGIN=http://localhost:5173
```

```bash
# Start development server
npm run dev
# Backend runs on http://localhost:3000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit if needed (defaults to localhost:3000)
nano .env
```

```bash
# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/health

---

## ☁️ AWS Setup

### Step 1: Create DynamoDB Tables

Create these tables in AWS DynamoDB Console:

#### Table 1: PawConnect-Users
- **Primary Key:** `userId` (String)
- **Sort Key:** `userType` (String)
- **Billing Mode:** On-Demand

#### Table 2: PawConnect-Pets
- **Primary Key:** `petId` (String)
- **Sort Key:** `shelterId` (String)
- **GSI:** `status-createdAt-index`
  - Partition key: `adoptionStatus` (String)
  - Sort key: `createdAt` (Number)
- **Billing Mode:** On-Demand

#### Table 3: PawConnect-Applications
- **Primary Key:** `applicationId` (String)
- **Sort Key:** `createdAt` (Number)
- **GSI:** `userId-index`
  - Partition key: `userId` (String)
- **GSI:** `petId-index`
  - Partition key: `petId` (String)
- **Billing Mode:** On-Demand

#### Table 4: PawConnect-Favorites
- **Primary Key:** `userId` (String)
- **Sort Key:** `petId` (String)
- **Billing Mode:** On-Demand

### Step 2: Create S3 Bucket

```bash
# Via AWS CLI
aws s3 mb s3://pawconnect-images-your-unique-id --region us-east-1
```

Or use the AWS Console:
1. Go to S3
2. Create bucket: `pawconnect-images-your-unique-id`
3. Unblock public access
4. Add bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::pawconnect-images-your-unique-id/*"
    }
  ]
}
```

5. Configure CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Step 3: Create IAM User

1. Go to IAM Console
2. Create user: `pawconnect-app`
3. Attach policies:
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
4. Create access key
5. Save credentials for `.env`

---

## 🚢 EC2 Deployment

### Step 1: Launch EC2 Instance

1. Go to EC2 Console
2. Launch instance:
   - **AMI:** Ubuntu 22.04 LTS
   - **Instance Type:** t2.small or t2.micro
   - **Key Pair:** Create and download `.pem` file
3. Configure Security Group:
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere
   - Custom TCP (3000) from anywhere
4. Launch instance

### Step 2: Connect and Setup

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Upload project files (from local machine)
scp -i your-key.pem -r pawconnect ubuntu@your-ec2-public-ip:~/

# Or clone from git
git clone <your-repo-url> pawconnect
cd pawconnect/backend
```

### Step 3: Run Startup Script

```bash
# Make script executable (if not already)
chmod +x startup.sh

# Run startup script
./startup.sh
```

This script will:
- Install Node.js 18
- Install PM2
- Install dependencies
- Create .env file
- Start the application

### Step 4: Configure Environment

```bash
# Edit .env with your AWS credentials
nano .env

# Restart the application
pm2 restart pawconnect
```

### Step 5: Verify Deployment

```bash
# Check if server is running
curl http://localhost:3000/health

# View logs
pm2 logs pawconnect

# Check status
pm2 status
```

### Deployment Updates

For future updates:

```bash
cd ~/pawconnect/backend
./deploy.sh
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=3000

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# DynamoDB Tables
DYNAMODB_USERS_TABLE=PawConnect-Users
DYNAMODB_PETS_TABLE=PawConnect-Pets
DYNAMODB_APPLICATIONS_TABLE=PawConnect-Applications
DYNAMODB_FAVORITES_TABLE=PawConnect-Favorites

# S3
S3_BUCKET_NAME=pawconnect-images-your-id

# CORS
CORS_ORIGIN=http://your-frontend-url.com
```

### Frontend (.env)

```env
VITE_API_URL=http://your-backend-url:3000/api
```

---

## 📚 API Documentation

### Authentication

All authenticated endpoints require `x-user-id` header.

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "adopter",
  "phone": "5551234567"
}
```

#### POST /api/auth/login
Login user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Pets

#### GET /api/pets
Get all pets with filters.

**Query Parameters:**
- `species` - dog, cat, other
- `gender` - male, female
- `minAge` - minimum age
- `maxAge` - maximum age
- `city` - city name
- `state` - state name
- `size` - small, medium, large, extra-large
- `query` - search by name or breed
- `limit` - results per page (default: 20)
- `offset` - pagination offset (default: 0)

#### GET /api/pets/:petId
Get pet details by ID.

#### POST /api/pets
Create new pet (shelter only).

**Request:**
```json
{
  "name": "Max",
  "breed": "Labrador",
  "species": "dog",
  "age": 3,
  "weight": 65,
  "gender": "male",
  "description": "Friendly and energetic...",
  "characteristics": ["friendly", "trained"],
  "city": "San Francisco",
  "state": "CA"
}
```

### Applications

#### POST /api/applications
Submit adoption application.

**Request:**
```json
{
  "petId": "pet-uuid",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "5551234567"
  },
  "livingInfo": {
    "livingType": "house",
    "hasYard": true,
    "householdMembers": 2
  },
  "petExperience": {
    "experienceLevel": "experienced",
    "reason": "Looking for a companion..."
  },
  "references": []
}
```

---

## 🧪 Testing

### Manual Testing

1. **Register as adopter:**
   - Go to `/auth?mode=register`
   - Select "Adopter"
   - Complete registration

2. **Register as shelter:**
   - Go to `/auth?mode=register`
   - Select "Shelter"
   - Complete registration

3. **Browse pets:**
   - Go to `/browse`
   - Test filters
   - Test search

4. **Apply for adoption:**
   - Click on a pet
   - Click "Apply to Adopt"
   - Complete application

5. **Check dashboard:**
   - Go to `/dashboard`
   - View applications
   - Check favorites

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Check logs
pm2 logs pawconnect

# Verify AWS credentials
aws sts get-caller-identity
```

### DynamoDB errors

- Verify table names in `.env` match AWS
- Check IAM permissions
- Verify AWS region is correct

### S3 upload errors

- Check bucket name is correct
- Verify bucket policy allows uploads
- Check CORS configuration
- Verify file size limits

### Frontend can't connect to backend

- Check CORS_ORIGIN in backend `.env`
- Verify API URL in frontend `.env`
- Check network tab in browser dev tools

---

## 📞 Support

For issues or questions:
- Email: support@pawconnect.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

Built with ❤️ for pets in need of homes.

**Connecting hearts, one paw at a time!** 🐾
