# 🌱 PawConnect Auto-Seed Feature

## What's New?

The backend now **automatically seeds 14 default pets** when you run `npm run dev` or `npm start`!

No more manual seeding required - just configure your AWS credentials and start the server.

---

## How It Works

### 1. Automatic Detection

When the server starts, it:
- ✅ Checks if AWS credentials are configured
- ✅ Checks if pets already exist in the database
- ✅ Seeds data only if needed (won't duplicate pets)

### 2. Smart Seeding

The auto-seed process:
1. Creates a default shelter if none exists
2. Adds 14 diverse pets:
   - 7 Dogs (Golden Retriever, Labrador, German Shepherd, Husky, Beagle, Poodle Mix, Pit Bull)
   - 5 Cats (Tabby, Siamese, Black Domestic Shorthair, Persian, Orange Tabby)
   - 2 Other (Rabbit, Guinea Pig)
3. All pets have complete profiles with images, characteristics, and locations

### 3. Zero Duplicates

The system checks if pets exist before seeding, so you can safely restart the server without creating duplicates!

---

## Usage

### Step 1: Configure AWS Credentials

Edit `/workspace/pawconnect/backend/.env`:

```env
# Replace placeholder values with your actual credentials
AWS_ACCESS_KEY_ID=AKIA...  # Your actual AWS access key
AWS_SECRET_ACCESS_KEY=wJalr...  # Your actual AWS secret key
AWS_REGION=us-east-1
S3_BUCKET_NAME=pawconnect-images-12345  # Your actual bucket name

# DynamoDB Tables (default values should work)
DYNAMODB_USERS_TABLE=PawConnect-Users
DYNAMODB_PETS_TABLE=PawConnect-Pets
DYNAMODB_APPLICATIONS_TABLE=PawConnect-Applications
DYNAMODB_FAVORITES_TABLE=PawConnect-Favorites
```

### Step 2: Start the Server

```bash
cd /workspace/pawconnect/backend
npm run dev
```

### Step 3: Watch the Magic! ✨

You'll see output like this:

```
🐾 ========================================
🐾 PawConnect Backend Server
🐾 ========================================
🚀 Server running on port 3000
📍 Environment: development
🌍 API URL: http://localhost:3000
💚 Health Check: http://localhost:3000/health
🐾 ========================================
✅ AWS credentials configured
📦 AWS Region: us-east-1
🪣 S3 Bucket: pawconnect-images-12345
🐾 ========================================
🐾 Ready to connect hearts, one paw at a time! 🐾
🐾 ========================================

🌱 Auto-seeding default data...

🔍 Checking if default data setup is needed...

No shelters found. Creating default shelter...
✓ Default shelter created: PawConnect Animal Shelter

Adding default pets...
✓ Added: Max (dog) - San Francisco, California
✓ Added: Bella (dog) - Los Angeles, California
✓ Added: Rocky (dog) - Austin, Texas
✓ Added: Luna (dog) - Seattle, Washington
✓ Added: Charlie (dog) - Boston, Massachusetts
✓ Added: Daisy (dog) - New York, New York
✓ Added: Duke (dog) - Miami, Florida
✓ Added: Whiskers (cat) - Portland, Oregon
✓ Added: Mittens (cat) - Chicago, Illinois
✓ Added: Shadow (cat) - Denver, Colorado
✓ Added: Luna (cat) - San Diego, California
✓ Added: Oliver (cat) - Phoenix, Arizona
✓ Added: Thumper (other) - Atlanta, Georgia
✓ Added: Pepper (other) - Nashville, Tennessee

=== Summary ===
Successfully added: 14 pets
Failed: 0 pets

✓ Default data setup complete!

🎉 Successfully seeded 14 default pets!
   - 7 Dogs (various breeds)
   - 5 Cats (various breeds)
   - 2 Other pets (rabbit & guinea pig)

👉 Visit http://localhost:5173/find-pets to see them!
```

### Step 4: Browse Pets

Open your browser and visit:
- **Find Pets:** http://localhost:5173/find-pets
- **Homepage:** http://localhost:5173

You'll see all 14 pets ready for adoption! 🐾

---

## On Subsequent Starts

When you restart the server, you'll see:

```
🌱 Auto-seeding default data...

🔍 Checking if default data setup is needed...

✓ Pets already exist in database. Skipping seed.

📊 Database already contains pets.
```

The system is smart enough to skip seeding if data already exists!

---

## Without AWS Credentials

If AWS credentials are not configured, you'll see:

```
⚠️  WARNING: AWS credentials not configured!
⚠️  Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env
⚠️  WARNING: S3_BUCKET_NAME not configured!

⏭️  Skipping auto-seed (AWS credentials not configured)
```

The server will still start, but won't attempt to seed data.

---

## Manual Seeding (Alternative)

If you prefer to seed manually, you can still use the standalone script:

```bash
cd /workspace/pawconnect/backend
node src/scripts/setupDefaultData.js
```

Or use the API endpoint:

```bash
# Login as shelter first, then:
curl -X POST http://localhost:3000/api/seed/default-pets \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_SHELTER_USER_ID"
```

---

## Features

### ✅ Automatic
- Seeds on every fresh database
- No manual intervention needed

### ✅ Safe
- Checks for existing data
- Won't duplicate pets
- Graceful error handling

### ✅ Complete
- 14 diverse pets
- All with images from Unsplash
- Various species, breeds, ages, sizes
- Different locations across the US

### ✅ Smart
- Skips if AWS not configured
- Skips if data exists
- Detailed logging

---

## Seeded Pets

### 🐕 Dogs (7)
1. **Max** - Golden Retriever, Male, 65 lbs, San Francisco, CA
2. **Bella** - Labrador Retriever, Female, 55 lbs, Los Angeles, CA
3. **Rocky** - German Shepherd, Male, 75 lbs, Austin, TX
4. **Luna** - Husky, Female, 45 lbs, Seattle, WA
5. **Charlie** - Beagle, Male, 25 lbs, Boston, MA
6. **Daisy** - Poodle Mix, Female, 18 lbs, New York, NY
7. **Duke** - Pit Bull Terrier, Male, 60 lbs, Miami, FL

### 🐈 Cats (5)
1. **Whiskers** - Tabby, Male, Portland, OR
2. **Mittens** - Siamese, Female, Chicago, IL
3. **Shadow** - Black Domestic Shorthair, Male, Denver, CO
4. **Luna** - Persian, Female, San Diego, CA
5. **Oliver** - Orange Tabby, Male, Phoenix, AZ

### 🐰 Other Pets (2)
1. **Thumper** - Holland Lop Rabbit, Male, Atlanta, GA
2. **Pepper** - Guinea Pig, Female, Nashville, TN

---

## Troubleshooting

### No pets showing after seeding?

Check the backend logs:
```bash
cat /tmp/backend_autoseed.log
```

### Want to reset and re-seed?

1. Delete all pets from DynamoDB console
2. Restart the server - it will auto-seed again!

### Manual seed endpoint not working?

The auto-seed happens at startup. If you want to manually trigger it:
```bash
# Make sure you're logged in as a shelter user
curl -X POST http://localhost:3000/api/seed/default-pets \
  -H "x-user-id: YOUR_SHELTER_ID"
```

---

## Code Changes Made

### Modified Files

1. **`src/scripts/setupDefaultData.js`**
   - Added `checkIfPetsExist()` function
   - Made `setupDefaultData()` return status instead of exiting
   - Exported functions for use in other modules
   - Can still be run standalone with `node src/scripts/setupDefaultData.js`

2. **`src/index.js`**
   - Imports `setupDefaultData` function
   - Detects AWS configuration on startup
   - Auto-calls seed function if AWS is configured
   - Shows helpful status messages
   - Graceful error handling

### Benefits

✅ **Developer-friendly:** No manual steps after configuring AWS  
✅ **Production-safe:** Only seeds on empty databases  
✅ **Beginner-friendly:** Clear messages about what's happening  
✅ **Testable:** Easy to test filters with diverse pet data  
✅ **Maintainable:** Seed script still works standalone  

---

## Next Steps

1. ✅ Configure your AWS credentials in `.env`
2. ✅ Run `npm run dev`
3. ✅ Watch the auto-seed happen
4. ✅ Visit http://localhost:5173/find-pets
5. ✅ Test all filters with the seeded pets!

**No more manual seeding - it just works!** 🎉

---

## Related Documentation

- **AWS Setup:** See `AWS_SETUP_GUIDE.md`
- **Credentials:** See `CREDENTIALS_SETUP.md`
- **Quick Start:** See `QUICKSTART.md`
- **Pet Visibility:** See `PET_VISIBILITY_FIX.md`

---

**Happy coding! 🐾**
