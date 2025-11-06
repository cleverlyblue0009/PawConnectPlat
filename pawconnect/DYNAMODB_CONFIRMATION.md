# DynamoDB Integration Confirmation

## ✅ YES - Pets are stored in DynamoDB!

When you add a pet through the "Add New Pet" form, here's exactly what happens:

## Data Flow

### 1. Frontend → Backend
- User fills out the AddPet form
- Images are uploaded along with pet data
- Data is sent to `/api/pets` endpoint via POST request

### 2. Backend Processing
**File**: `backend/src/controllers/petController.js`
```javascript
const createPet = asyncHandler(async (req, res) => {
  // Upload images to S3
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    imageUrls = await uploadMultipleToS3(req.files, 'pets');
  }

  // Prepare pet data
  const petData = {
    ...req.body,
    shelterId,
    images: imageUrls,
    characteristics: req.body.characteristics ? JSON.parse(req.body.characteristics) : [],
  };

  // THIS CALLS THE MODEL TO SAVE IN DYNAMODB
  const pet = await petModel.createPet(petData);
  
  successResponse(res, pet, 'Pet created successfully', 201);
});
```

### 3. DynamoDB Storage
**File**: `backend/src/models/petModel.js`
```javascript
const createPet = async (petData) => {
  const petId = uuidv4();

  const pet = {
    petId,
    shelterId: petData.shelterId,
    name: petData.name,
    breed: petData.breed,
    // ... all other fields
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // THIS WRITES TO DYNAMODB
  const command = new PutCommand({
    TableName: TABLES.PETS,  // 'PawConnect-Pets'
    Item: pet,
  });

  await docClient.send(command);  // AWS SDK sends to DynamoDB
  return pet;
};
```

## Where Data is Stored

### DynamoDB Table
- **Table Name**: `PawConnect-Pets` (or value from env var `DYNAMODB_PETS_TABLE`)
- **Primary Key**: 
  - Partition Key: `petId` (UUID)
  - Sort Key: `shelterId` (UUID)

### S3 Bucket
- **Bucket Name**: Value from env var `S3_BUCKET_NAME`
- **Path**: `pets/[timestamp]-[originalname]`
- Image URLs are stored in DynamoDB's `images` array field

## What You'll See in AWS Console

### In DynamoDB Console:
Navigate to: **DynamoDB → Tables → PawConnect-Pets → Items**

Each pet will show as an item with fields like:
```json
{
  "petId": "550e8400-e29b-41d4-a716-446655440000",
  "shelterId": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Max",
  "breed": "Golden Retriever",
  "species": "dog",
  "age": 3,
  "gender": "male",
  "size": "large",
  "description": "Friendly and energetic...",
  "images": [
    "https://your-bucket.s3.amazonaws.com/pets/1699...-max1.jpg",
    "https://your-bucket.s3.amazonaws.com/pets/1699...-max2.jpg"
  ],
  "characteristics": ["Friendly", "House-trained", "Good with kids"],
  "city": "San Francisco",
  "state": "California",
  "adoptionStatus": "available",
  "adoptionFee": 150,
  "createdAt": 1699304847293,
  "updatedAt": 1699304847293
}
```

### In S3 Console:
Navigate to: **S3 → Buckets → [Your Bucket] → pets/**

You'll see uploaded images with filenames like:
- `1699304847293-golden-retriever-1.jpg`
- `1699304847293-golden-retriever-2.jpg`

## All CRUD Operations Use DynamoDB

✅ **CREATE** - `PutCommand` - Adds new pet to DynamoDB  
✅ **READ** - `ScanCommand/GetCommand` - Retrieves pets from DynamoDB  
✅ **UPDATE** - `UpdateCommand` - Updates pet in DynamoDB  
✅ **DELETE** - `DeleteCommand` - Removes pet from DynamoDB  

## Testing the Integration

1. **Add a pet** through the form
2. **Check DynamoDB** console - you'll see the new item
3. **Check S3** console - you'll see the uploaded images
4. **Browse pets** on the website - data comes from DynamoDB
5. **Edit the pet** - updates are written to DynamoDB
6. **Delete the pet** - item is removed from DynamoDB

## Required Environment Variables

Make sure your backend has these set:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
DYNAMODB_PETS_TABLE=PawConnect-Pets
S3_BUCKET_NAME=your-bucket-name
```

## Summary

✅ **Yes, all pet data is stored in DynamoDB**  
✅ **Yes, you will see changes in AWS DynamoDB console**  
✅ **Yes, images are uploaded to S3 with URLs stored in DynamoDB**  
✅ **All operations (add, edit, delete, browse) interact with DynamoDB**

The backend is fully integrated with AWS services!
