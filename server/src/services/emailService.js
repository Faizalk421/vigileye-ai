import { logger } from '../utils/logger.js';
import { ENV } from '../config/env.js';

export const sendVerificationEmail = async (email, token, fullName) => {
  const verificationUrl = `${ENV.CLIENT_URL}/verify-email?token=${token}`;
  
  logger.info(`[EMAIL SERVICE] Verification Email for ${email}`);
  logger.info(`[EMAIL SERVICE] Verification Link: ${verificationUrl}`);

  // In development, the token is logged so the developer/user can click or copy it directly.
  return {
    success: true,
    message: 'Verification email sent successfully.',
    previewToken: token,
    previewUrl: verificationUrl
  };
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${ENV.CLIENT_URL}/reset-password?token=${token}`;

  logger.info(`[EMAIL SERVICE] Password Reset Email for ${email}`);
  logger.info(`[EMAIL SERVICE] Reset Link: ${resetUrl}`);

  return {
    success: true,
    message: 'Password reset link sent successfully.',
    previewToken: token,
    previewUrl: resetUrl
  };
};

export const sendSecurityAlertEmail = async (email, alertType, details) => {
  logger.info(`[EMAIL SERVICE] Security Alert for ${email}: ${alertType} - ${details}`);
  return { success: true };
};
