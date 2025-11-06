# 🚀 PawConnect - Quick Start Guide

Get PawConnect running in minutes!

## Option 1: Local Development (5 minutes)

### 1. Prerequisites
- Node.js 18+ installed
- AWS account with credentials ready

### 2. Backend Setup
```bash
cd pawconnect/backend
npm install
cp .env.example .env
# Edit .env with your AWS credentials
npm run dev
```

Backend runs on `http://localhost:3000`

### 3. Frontend Setup
```bash
# In a new terminal
cd pawconnect/frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Done!
Open http://localhost:5173 in your browser

---

## Option 2: AWS EC2 Deployment (30 minutes)

### 1. Setup AWS Services
Follow `AWS_SETUP_GUIDE.md` to create:
- ✅ 4 DynamoDB tables
- ✅ S3 bucket
- ✅ IAM user with credentials
- ✅ EC2 instance

### 2. Deploy Backend
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Upload code or clone repo
git clone YOUR-REPO pawconnect
cd pawconnect/backend

# Run startup script
chmod +x startup.sh
./startup.sh

# Edit .env with credentials
nano .env

# Restart
pm2 restart pawconnect
```

### 3. Test
```bash
curl http://your-ec2-ip:3000/health
```

---

## First Steps After Setup

### Create Test Accounts

**1. Register as Shelter:**
- Go to `/auth?mode=register`
- Select "Shelter"
- Enter details
- Login

**2. Add a Pet:**
- Go to Dashboard
- Click "Add New Pet"
- Upload images and details

**3. Register as Adopter:**
- Logout
- Register as new user
- Select "Adopter"

**4. Browse & Apply:**
- Browse pets
- Click on a pet
- Submit application

---

## Key URLs

### Local Development
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Health: http://localhost:3000/health

### Production
- Frontend: http://your-domain.com
- Backend: http://your-ec2-ip:3000
- API Health: http://your-ec2-ip:3000/health

---

## Environment Variables Checklist

### Backend (.env)
```bash
✅ AWS_REGION=us-east-1
✅ AWS_ACCESS_KEY_ID=your_key
✅ AWS_SECRET_ACCESS_KEY=your_secret
✅ DYNAMODB_USERS_TABLE=PawConnect-Users
✅ DYNAMODB_PETS_TABLE=PawConnect-Pets
✅ DYNAMODB_APPLICATIONS_TABLE=PawConnect-Applications
✅ DYNAMODB_FAVORITES_TABLE=PawConnect-Favorites
✅ S3_BUCKET_NAME=your-bucket-name
```

### Frontend (.env)
```bash
✅ VITE_API_URL=http://localhost:3000/api
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs pawconnect

# Check if port 3000 is in use
lsof -i :3000

# Verify AWS credentials
aws sts get-caller-identity
```

### Frontend can't connect
- Check CORS_ORIGIN in backend .env
- Verify VITE_API_URL in frontend .env
- Check browser console for errors

### AWS Errors
- Verify table names match .env
- Check IAM permissions
- Verify AWS region is correct

---

## Common Commands

### Backend
```bash
npm run dev          # Start development server
npm start            # Start production server
pm2 restart pawconnect  # Restart with PM2
pm2 logs pawconnect     # View logs
pm2 status              # Check status
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Project Structure

```
pawconnect/
├── backend/         # Node.js/Express API
│   ├── src/
│   │   ├── config/      # AWS configuration
│   │   ├── models/      # DynamoDB models
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Business logic
│   │   ├── middleware/  # Auth, uploads, errors
│   │   └── utils/       # Helper functions
│   └── .env         # Environment variables
├── frontend/        # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API calls
│   │   ├── context/     # Auth context
│   │   └── styles/      # Tailwind CSS
│   └── .env         # Environment variables
└── README.md        # Full documentation
```

---

## Next Steps

1. ✅ Complete AWS setup
2. ✅ Deploy backend to EC2
3. ⬜ Set up domain name
4. ⬜ Configure HTTPS
5. ⬜ Deploy frontend to S3/CloudFront
6. ⬜ Set up monitoring
7. ⬜ Add more features!

---

## Resources

- **Full Documentation:** See README.md
- **AWS Setup:** See AWS_SETUP_GUIDE.md
- **API Reference:** See README.md#api-documentation

---

## Need Help?

- Check logs: `pm2 logs pawconnect`
- Review documentation: README.md
- AWS issues: AWS_SETUP_GUIDE.md

---

**Happy coding! 🐾**
