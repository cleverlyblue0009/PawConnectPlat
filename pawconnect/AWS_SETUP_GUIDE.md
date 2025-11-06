# AWS Setup Guide for PawConnect

Complete step-by-step guide to set up AWS services for PawConnect.

## Table of Contents
1. [DynamoDB Setup](#dynamodb-setup)
2. [S3 Setup](#s3-setup)
3. [IAM User Setup](#iam-user-setup)
4. [EC2 Setup](#ec2-setup)

---

## 1. DynamoDB Setup

### Create Users Table

1. Go to [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Click **Create table**
3. Configure:
   - **Table name:** `PawConnect-Users`
   - **Partition key:** `userId` (String)
   - **Sort key:** `userType` (String)
   - **Table settings:** Default settings
   - **Read/write capacity:** On-demand
4. Click **Create table**

### Create Pets Table

1. Click **Create table**
2. Configure:
   - **Table name:** `PawConnect-Pets`
   - **Partition key:** `petId` (String)
   - **Sort key:** `shelterId` (String)
   - **Table settings:** Default settings
3. Click **Create table**
4. After creation, add GSI:
   - Click on the table
   - Go to **Indexes** tab
   - Click **Create index**
   - **Partition key:** `adoptionStatus` (String)
   - **Sort key:** `createdAt` (Number)
   - **Index name:** `status-createdAt-index`
   - Click **Create index**

### Create Applications Table

1. Click **Create table**
2. Configure:
   - **Table name:** `PawConnect-Applications`
   - **Partition key:** `applicationId` (String)
   - **Sort key:** `createdAt` (Number)
3. Click **Create table**
4. Add GSIs:
   - **GSI 1:**
     - Partition key: `userId` (String)
     - Index name: `userId-index`
   - **GSI 2:**
     - Partition key: `petId` (String)
     - Index name: `petId-index`

### Create Favorites Table

1. Click **Create table**
2. Configure:
   - **Table name:** `PawConnect-Favorites`
   - **Partition key:** `userId` (String)
   - **Sort key:** `petId` (String)
3. Click **Create table**

---

## 2. S3 Setup

### Create S3 Bucket

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click **Create bucket**
3. Configure:
   - **Bucket name:** `pawconnect-images-[your-random-id]` (must be globally unique)
   - **Region:** us-east-1 (or your preferred region)
   - **Block all public access:** UNCHECK this (we need public read)
4. Click **Create bucket**

### Configure Bucket Policy

1. Click on your bucket
2. Go to **Permissions** tab
3. Scroll to **Bucket policy**
4. Click **Edit**
5. Paste this policy (replace bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::pawconnect-images-YOUR-ID/*"
    }
  ]
}
```

6. Click **Save changes**

### Configure CORS

1. Stay in **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Click **Edit**
4. Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

5. Click **Save changes**

---

## 3. IAM User Setup

### Create IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** in left sidebar
3. Click **Add users**
4. Configure:
   - **User name:** `pawconnect-app`
   - **Access type:** Access key - Programmatic access
5. Click **Next: Permissions**

### Attach Policies

1. Click **Attach existing policies directly**
2. Search and select:
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
3. Click **Next: Tags** (skip tags)
4. Click **Next: Review**
5. Click **Create user**

### Save Credentials

1. **IMPORTANT:** Copy these immediately (shown only once):
   - **Access key ID:** `AKIA...`
   - **Secret access key:** `wJalr...`
2. Download CSV file as backup
3. Store securely - you'll need these for `.env` file

---

## 4. EC2 Setup

### Launch EC2 Instance

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **Launch instance**
3. Configure:
   - **Name:** `pawconnect-backend`
   - **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance type:** t2.micro (free tier) or t2.small
   - **Key pair:** 
     - Click **Create new key pair**
     - Name: `pawconnect-key`
     - Type: RSA
     - Format: .pem
     - Download and save securely
   - **Network settings:**
     - Allow SSH, HTTP, HTTPS
     - Allow custom TCP port 3000
   - **Storage:** 8 GB gp2 (default)
4. Click **Launch instance**

### Configure Security Group

1. Click **Security Groups** in left sidebar
2. Click on your instance's security group
3. Click **Edit inbound rules**
4. Add these rules:

| Type        | Protocol | Port Range | Source    | Description       |
|-------------|----------|------------|-----------|-------------------|
| SSH         | TCP      | 22         | My IP     | SSH access        |
| HTTP        | TCP      | 80         | 0.0.0.0/0 | HTTP access       |
| HTTPS       | TCP      | 443        | 0.0.0.0/0 | HTTPS access      |
| Custom TCP  | TCP      | 3000       | 0.0.0.0/0 | Backend API       |

5. Click **Save rules**

### Connect to EC2

1. Go back to **Instances**
2. Select your instance
3. Copy **Public IPv4 address**
4. Connect via SSH:

```bash
# Change permissions on key file
chmod 400 pawconnect-key.pem

# Connect
ssh -i pawconnect-key.pem ubuntu@YOUR-EC2-PUBLIC-IP
```

### Setup Backend on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x
npm --version

# Install PM2
sudo npm install -g pm2

# Install Git (if using)
sudo apt install -y git

# Upload your code or clone from git
git clone YOUR-REPO-URL pawconnect
cd pawconnect/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env  # Edit with your AWS credentials

# Start with PM2
pm2 start src/index.js --name "pawconnect"
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs pawconnect
```

### Test Deployment

```bash
# Test locally on EC2
curl http://localhost:3000/health

# Test from your machine
curl http://YOUR-EC2-PUBLIC-IP:3000/health
```

---

## Verification Checklist

After setup, verify:

- [ ] All 4 DynamoDB tables created
- [ ] S3 bucket created with public read policy
- [ ] S3 CORS configured
- [ ] IAM user created with access keys
- [ ] EC2 instance running
- [ ] Security group configured
- [ ] Backend deployed and accessible
- [ ] Health check endpoint responding

---

## Cost Estimates

**Free Tier (First 12 months):**
- EC2 t2.micro: 750 hours/month FREE
- S3: 5GB storage FREE
- DynamoDB: 25GB storage FREE, 200M requests/month FREE

**After Free Tier:**
- EC2 t2.small: ~$17/month
- S3: ~$0.023/GB/month
- DynamoDB: Pay per request (very low for small apps)

**Estimated total for small app:** $20-30/month

---

## Security Best Practices

1. **Never commit credentials to git**
2. **Use strong passwords**
3. **Restrict IAM permissions** (use least privilege)
4. **Keep Node.js and dependencies updated**
5. **Use HTTPS** in production (set up with Let's Encrypt)
6. **Enable CloudWatch logging**
7. **Set up AWS budgets** to avoid unexpected charges
8. **Regularly rotate access keys**

---

## Troubleshooting

### Can't connect to EC2
- Check security group allows SSH from your IP
- Verify key file permissions (chmod 400)
- Check instance is running

### DynamoDB access denied
- Verify IAM user has correct permissions
- Check table names match `.env`
- Verify AWS region is correct

### S3 upload fails
- Check bucket policy allows public access
- Verify CORS configuration
- Check IAM user has S3 permissions

### Backend won't start
- Check `.env` file exists and has correct values
- Verify all required environment variables are set
- Check logs: `pm2 logs pawconnect`

---

## Next Steps

After AWS setup:
1. Test all endpoints
2. Set up domain name (Route 53)
3. Configure HTTPS (Let's Encrypt)
4. Set up monitoring (CloudWatch)
5. Configure automatic backups
6. Set up CI/CD pipeline

---

**Need Help?**
- AWS Documentation: https://docs.aws.amazon.com/
- AWS Support: https://console.aws.amazon.com/support/
