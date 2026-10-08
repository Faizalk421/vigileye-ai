import { prisma } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { generate2FASecret, verify2FAToken } from '../services/totpService.js';
import crypto from 'crypto';

export const register = async (req, res, next) => {
  try {
    const { fullName, username, email, password, phone, dob, country } = req.body;

    // Check unique constraints
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
      }
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return errorResponse(res, 'Email is already registered.', 409);
      }
      return errorResponse(res, 'Username is already taken.', 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        phone: phone || null,
        dob: dob || null,
        country: country || 'United States',
        role: 'USER',
        profile: {
          create: {
            themePreference: 'dark',
            occupation: 'Professional'
          }
        },
        settings: {
          create: {
            earThreshold: 0.21,
            drowsinessThreshold: 1.5,
            alarmVolume: 0.8,
            alarmPattern: 'siren',
            darkMode: true
          }
        },
        notifications: {
          create: {
            title: 'Welcome to VigilEye AI!',
            message: 'Your account is ready. Calibrate your eyes in Settings or run a live monitoring session.',
            type: 'SYSTEM'
          }
        }
      },
      include: {
        profile: true,
        settings: true
      }
    });

    // Create Email Verification Token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verifyToken,
        expiresAt: tokenExpiry
      }
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, verifyToken, user.fullName);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    // Log Security Event
    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        eventType: 'LOGIN',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Web Browser',
        location: 'Account Created'
      }
    });

    const { passwordHash: _, ...safeUser } = user;

    return successResponse(
      res,
      'Registration successful! Please verify your email.',
      {
        user: safeUser,
        accessToken,
        refreshToken,
        previewToken: emailResult.previewToken
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password, twoFactorCode } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { username: identifier.toLowerCase() }
        ]
      },
      include: {
        profile: true,
        settings: true
      }
    });

    if (!user) {
      return errorResponse(res, 'Invalid email/username or password.', 401);
    }

    if (user.isSuspended) {
      return errorResponse(res, 'This account has been suspended. Please contact administrator.', 403);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      // Log failed login
      await prisma.securityEvent.create({
        data: {
          userId: user.id,
          eventType: 'FAILED_LOGIN',
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Web Browser',
          location: 'Failed Attempt'
        }
      });
      return errorResponse(res, 'Invalid email/username or password.', 401);
    }

    // Check if 2FA is required
    if (user.isTwoFactorEnabled) {
      if (!twoFactorCode) {
        return successResponse(res, 'Two-Factor Authentication required.', {
          requires2FA: true,
          userId: user.id
        });
      }

      const isValid2FA = verify2FAToken(twoFactorCode, user.twoFactorSecret);
      if (!isValid2FA) {
        return errorResponse(res, 'Invalid 2FA code.', 401);
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        eventType: 'LOGIN',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Web Browser',
        location: 'Active Session'
      }
    });

    const { passwordHash: _, twoFactorSecret: __, ...safeUser } = user;

    return successResponse(res, 'Login successful.', {
      user: safeUser,
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true }
      });
    }

    if (req.user) {
      await prisma.securityEvent.create({
        data: {
          userId: req.user.id,
          eventType: 'LOGOUT',
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Web Browser',
          location: 'Logged Out'
        }
      });
    }

    return successResponse(res, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required.', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      return errorResponse(res, 'Refresh token is invalid or expired.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { profile: true, settings: true }
    });

    if (!user || user.isSuspended) {
      return errorResponse(res, 'User account is unavailable.', 401);
    }

    const newAccessToken = generateAccessToken(user);

    return successResponse(res, 'Token refreshed.', {
      accessToken: newAccessToken
    });
  } catch (error) {
    return errorResponse(res, 'Invalid refresh token.', 401);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // For security, always respond with generic message
    if (!user) {
      return successResponse(
        res,
        'If an account with that email exists, a password reset link has been sent.'
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: tokenExpiry
      }
    });

    const emailResult = await sendPasswordResetEmail(user.email, resetToken);

    return successResponse(
      res,
      'If an account with that email exists, a password reset link has been sent.',
      {
        previewToken: emailResult.previewToken
      }
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      return errorResponse(res, 'Password reset token is invalid or has expired.', 400);
    }

    const newHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { used: true }
      }),
      prisma.securityEvent.create({
        data: {
          userId: resetRecord.userId,
          eventType: 'PASSWORD_CHANGE',
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Web Browser',
          location: 'Password Reset Via Email'
        }
      })
    ]);

    return successResponse(res, 'Password has been reset successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    const record = await prisma.emailVerificationToken.findUnique({
      where: { token }
    });

    if (!record || record.used || record.expiresAt < new Date()) {
      return errorResponse(res, 'Verification token is invalid or has expired.', 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { isEmailVerified: true }
      }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { used: true }
      }),
      prisma.notification.create({
        data: {
          userId: record.userId,
          title: 'Email Verified',
          message: 'Your email address has been successfully verified.',
          type: 'SECURITY'
        }
      })
    ]);

    return successResponse(res, 'Email verified successfully.');
  } catch (error) {
    next(error);
  }
};

export const setup2FA = async (req, res, next) => {
  try {
    const { secret, qrCodeUrl } = await generate2FASecret(req.user.username);

    // Save temporary secret
    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorSecret: secret }
    });

    return successResponse(res, '2FA setup initialized.', {
      secret,
      qrCodeUrl
    });
  } catch (error) {
    next(error);
  }
};

export const verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user.twoFactorSecret) {
      return errorResponse(res, 'Please initiate 2FA setup first.', 400);
    }

    const isValid = verify2FAToken(token, user.twoFactorSecret);
    if (!isValid) {
      return errorResponse(res, 'Invalid 2FA verification code.', 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { isTwoFactorEnabled: true }
      }),
      prisma.securityEvent.create({
        data: {
          userId: user.id,
          eventType: 'TWO_FACTOR_ENABLED',
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Web Browser',
          location: '2FA Enabled'
        }
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Two-Factor Authentication Enabled',
          message: 'Your account is now secured with authenticator 2FA.',
          type: 'SECURITY'
        }
      })
    ]);

    return successResponse(res, 'Two-factor authentication enabled successfully.');
  } catch (error) {
    next(error);
  }
};

export const disable2FA = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null
      }
    });

    return successResponse(res, 'Two-factor authentication disabled.');
  } catch (error) {
    next(error);
  }
};
