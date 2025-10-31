/**
 * Environment Variable Validation Utility
 * Validates required environment variables on server startup
 */

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'COOKIE_NAME',
  'CORS_ORIGINS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const optionalEnvVars = [
  'FRONTEND_BASE_URL',
  'FIREBASE_SERVICE_ACCOUNT', // Optional: for Firebase Auth
];

export const validateEnv = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check optional but recommended variables
  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  // If any required variables are missing, throw error
  if (missing.length > 0) {
    console.error('❌ ERROR: Missing required environment variables:');
    for (const varName of missing) {
      console.error(`  - ${varName}`);
    }
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    console.error('See .env.example for reference.\n');
    process.exit(1);
  }

  // Warn about optional variables
  if (warnings.length > 0) {
    console.warn('⚠️  WARNING: Optional environment variables not set:');
    for (const varName of warnings) {
      console.warn(`  - ${varName}`);
    }
    console.warn('Some features may not work as expected.\n');
  }

  // Validate specific formats
  validateSpecificVars();

  console.log('✅ Environment variables validated successfully\n');
};

const validateSpecificVars = () => {
  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security');
  }

  // Validate CORS_ORIGINS format
  if (process.env.CORS_ORIGINS) {
    const origins = process.env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
    if (origins.length === 0) {
      console.warn('⚠️  WARNING: CORS_ORIGINS is set but empty. This may cause CORS issues.');
    }
  }

  // Validate NODE_ENV
  const validEnvs = ['development', 'production', 'test'];
  if (process.env.NODE_ENV && !validEnvs.includes(process.env.NODE_ENV)) {
    console.warn(`⚠️  WARNING: NODE_ENV="${process.env.NODE_ENV}" is not a standard value. Expected: ${validEnvs.join(', ')}`);
  }

  // Validate MongoDB URI format
  if (process.env.MONGO_URI && !process.env.MONGO_URI.startsWith('mongodb')) {
    console.error('❌ ERROR: MONGO_URI must start with "mongodb://" or "mongodb+srv://"');
    process.exit(1);
  }
};

export default validateEnv;
