import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_w6OeB9HCvYGU@ep-morning-math-b34mqyh6-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'travelhub_jwt_access_secret_key_super_secure_2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'travelhub_jwt_refresh_secret_key_super_secure_2026',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_travelhub_mock',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_travelhub_mock',
  },
  openWeather: {
    apiKey: process.env.OPENWEATHER_API_KEY || 'mock_key',
  },
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || 'mock_key',
  },
};
