import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'vigileye_super_secret_jwt_access_token_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'vigileye_super_secret_jwt_refresh_token_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    PORT: parseInt(process.env.EMAIL_PORT || '2525', 10),
    USER: process.env.EMAIL_USER || '',
    PASSWORD: process.env.EMAIL_PASSWORD || '',
    FROM: process.env.EMAIL_FROM || 'no-reply@vigileye.ai'
  }
};
