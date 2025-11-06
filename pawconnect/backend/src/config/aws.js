const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');

// Configure AWS credentials and region
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Create DynamoDB client
const dynamoDBClient = new DynamoDBClient(awsConfig);

// Create DynamoDB Document client for easier operations
const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Create S3 client
const s3Client = new S3Client(awsConfig);

// Table names
const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'PawConnect-Users',
  PETS: process.env.DYNAMODB_PETS_TABLE || 'PawConnect-Pets',
  APPLICATIONS: process.env.DYNAMODB_APPLICATIONS_TABLE || 'PawConnect-Applications',
  FAVORITES: process.env.DYNAMODB_FAVORITES_TABLE || 'PawConnect-Favorites',
};

// S3 bucket name
const S3_BUCKET = process.env.S3_BUCKET_NAME;

module.exports = {
  dynamoDBClient,
  docClient,
  s3Client,
  TABLES,
  S3_BUCKET,
};
