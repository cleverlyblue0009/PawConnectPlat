# PawConnect - AWS Credentials Setup Required

## Current Issue

Your PawConnect application shows "0 pets available" because the backend cannot connect to AWS DynamoDB. The `.env` file currently has placeholder credentials.

## Quick Fix

### Step 1: Get Your AWS Credentials

1. Log into [AWS Console](https://console.aws.amazon.com/)
2. Go to **IAM** → **Users** → Select your user (or create one)
3. Click **Security credentials** tab
4. Click **Create access key**
5. Copy your:
   - Access Key ID (starts with `AKIA...`)
   - Secret Access Key (shown only once!)

### Step 2: Update Backend .env File

Edit `/workspace/pawconnect/backend/.env` and replace these lines:

```env
# Replace these placeholder values:
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=pawconnect-images-your-id

# With your actual credentials:
AWS_ACCESS_KEY_ID=AKIA...  # Your actual key
AWS_SECRET_ACCESS_KEY=wJalr...  # Your actual secret
S3_BUCKET_NAME=pawconnect-images-12345  # Your actual bucket name
```

### Step 3: Restart the Backend

```bash
cd /workspace/pawconnect/backend
pkill -f "node src/index.js"
PORT=3000 npm start &
```

### Step 4: Seed Default Pets

Once credentials are configured, run this in your browser console (F12):

```javascript
const user = JSON.parse(localStorage.getItem('pawconnect_user'));
fetch('http://localhost:3000/api/seed/default-pets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': user.userId
  }
})
.then(r => r.json())
.then(data => console.log('✅ Seeded:', data))
.catch(err => console.error('❌ Error:', err));
```

This will add 14 default pets (7 dogs, 5 cats, 2 other pets) to your database!

---

## Don't Have AWS Set Up Yet?

### Option A: Quick AWS Setup (30 minutes)

Follow the complete guide in `/workspace/pawconnect/AWS_SETUP_GUIDE.md` to:
1. Create DynamoDB tables
2. Create S3 bucket
3. Create IAM user with access keys
4. Configure security policies

### Option B: Use LocalStack for Development (Advanced)

If you want to develop locally without AWS:

1. Install LocalStack:
```bash
pip install localstack
localstack start
```

2. Update `.env` to point to LocalStack:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT=http://localhost:4566
```

3. Create local tables:
```bash
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name PawConnect-Pets \
  --attribute-definitions AttributeName=petId,AttributeType=S AttributeName=shelterId,AttributeType=S \
  --key-schema AttributeName=petId,KeyType=HASH AttributeName=shelterId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

---

## Verification

After setting up credentials, verify the backend can connect:

```bash
curl http://localhost:3000/health
```

Should show:
```json
{
  "success": true,
  "message": "PawConnect API is running"
}
```

Then test pets endpoint:
```bash
curl http://localhost:3000/api/pets
```

Should return pet data (or empty array if no pets added yet).

---

## Need Help?

- **AWS Setup**: See `/workspace/pawconnect/AWS_SETUP_GUIDE.md`
- **Quick Start**: See `/workspace/pawconnect/QUICKSTART.md`
- **Seeding Data**: See `/workspace/pawconnect/PET_VISIBILITY_FIX.md`

---

**Current Status:**
- ✅ Backend code is ready
- ✅ Frontend is ready
- ✅ Seed data script is ready
- ❌ AWS credentials need to be configured
- ❌ Pets need to be seeded to database

Once you add your AWS credentials and restart the backend, everything will work! 🐾
