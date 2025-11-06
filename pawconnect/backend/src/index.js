require('dotenv').config();
const app = require('./server');

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log('🐾 ========================================');
  console.log('🐾 PawConnect Backend Server');
  console.log('🐾 ========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 API URL: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log('🐾 ========================================');
  
  // Log AWS configuration status
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('✅ AWS credentials configured');
    console.log(`📦 AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
  } else {
    console.warn('⚠️  WARNING: AWS credentials not configured!');
    console.warn('⚠️  Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env');
  }
  
  if (process.env.S3_BUCKET_NAME) {
    console.log(`🪣 S3 Bucket: ${process.env.S3_BUCKET_NAME}`);
  } else {
    console.warn('⚠️  WARNING: S3_BUCKET_NAME not configured!');
  }
  
  console.log('🐾 ========================================');
  console.log('🐾 Ready to connect hearts, one paw at a time! 🐾');
  console.log('🐾 ========================================\n');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
