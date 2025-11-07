require('dotenv').config();
const app = require('./server');
const { setupDefaultData } = require('./scripts/setupDefaultData');

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, async () => {
  console.log('🐾 ========================================');
  console.log('🐾 PawConnect Backend Server');
  console.log('🐾 ========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 API URL: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log('🐾 ========================================');
  
  // Log AWS configuration status
  const awsConfigured = process.env.AWS_ACCESS_KEY_ID && 
                        process.env.AWS_SECRET_ACCESS_KEY && 
                        process.env.AWS_ACCESS_KEY_ID !== 'your_access_key_here';
  
  if (awsConfigured) {
    console.log('✅ AWS credentials configured');
    console.log(`📦 AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
  } else {
    console.warn('⚠️  WARNING: AWS credentials not configured!');
    console.warn('⚠️  Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env');
  }
  
  if (process.env.S3_BUCKET_NAME && process.env.S3_BUCKET_NAME !== 'pawconnect-images-your-id') {
    console.log(`🪣 S3 Bucket: ${process.env.S3_BUCKET_NAME}`);
  } else {
    console.warn('⚠️  WARNING: S3_BUCKET_NAME not configured!');
  }
  
  console.log('🐾 ========================================');
  console.log('🐾 Ready to connect hearts, one paw at a time! 🐾');
  console.log('🐾 ========================================\n');
  
  // Auto-seed default data if AWS is configured
  if (awsConfigured) {
    console.log('🌱 Auto-seeding default data...\n');
    try {
      const result = await setupDefaultData();
      if (result.success && !result.skipped) {
        console.log('\n🎉 Successfully seeded 14 default pets!');
        console.log('   - 7 Dogs (various breeds)');
        console.log('   - 5 Cats (various breeds)');
        console.log('   - 2 Other pets (rabbit & guinea pig)');
        console.log('\n👉 Visit http://localhost:5173/find-pets to see them!\n');
      } else if (result.skipped) {
        console.log('📊 Database already contains pets.\n');
      }
    } catch (error) {
      console.warn('⚠️  Auto-seed skipped:', error.message);
      console.warn('   You can manually seed data using: POST /api/seed/default-pets\n');
    }
  } else {
    console.log('⏭️  Skipping auto-seed (AWS credentials not configured)\n');
  }
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
