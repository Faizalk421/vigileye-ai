import { prisma } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        settings: true
      }
    });

    const { passwordHash: _, twoFactorSecret: __, ...safeUser } = user;
    return successResponse(res, 'User profile fetched.', safeUser);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const { fullName, phone, dob, country, timezone, language, bio, occupation, emergencyContact, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(dob !== undefined && { dob }),
        ...(country !== undefined && { country }),
        ...(timezone !== undefined && { timezone }),
        ...(language !== undefined && { language }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        profile: {
          upsert: {
            create: {
              bio: bio || null,
              occupation: occupation || null,
              emergencyContact: emergencyContact || null
            },
            update: {
              ...(bio !== undefined && { bio }),
              ...(occupation !== undefined && { occupation }),
              ...(emergencyContact !== undefined && { emergencyContact })
            }
          }
        }
      },
      include: {
        profile: true,
        settings: true
      }
    });

    const { passwordHash: _, twoFactorSecret: __, ...safeUser } = user;
    return successResponse(res, 'Profile updated successfully.', safeUser);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settingsData = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        ...settingsData
      },
      update: settingsData
    });

    return successResponse(res, 'Settings updated successfully.', settings);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Current password does not match.', 400);
    }

    const newHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: { passwordHash: newHash }
      }),
      prisma.securityEvent.create({
        data: {
          userId: req.user.id,
          eventType: 'PASSWORD_CHANGE',
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Web Browser',
          location: 'Security Settings'
        }
      }),
      prisma.notification.create({
        data: {
          userId: req.user.id,
          title: 'Password Changed',
          message: 'Your account password was updated successfully.',
          type: 'SECURITY'
        }
      })
    ]);

    return successResponse(res, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

export const getSecurityLogs = async (req, res, next) => {
  try {
    const [events, activeTokens] = await Promise.all([
      prisma.securityEvent.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.refreshToken.findMany({
        where: { userId: req.user.id, revoked: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return successResponse(res, 'Security logs fetched.', {
      events,
      activeSessions: activeTokens
    });
  } catch (error) {
    next(error);
  }
};

export const revokeAllSessions = async (req, res, next) => {
  try {
    await prisma.refreshToken.updateMany({
      where: { userId: req.user.id },
      data: { revoked: true }
    });

    await prisma.securityEvent.create({
      data: {
        userId: req.user.id,
        eventType: 'SESSION_REVOKED',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Web Browser',
        location: 'All Sessions Terminated'
      }
    });

    return successResponse(res, 'All active sessions have been revoked.');
  } catch (error) {
    next(error);
  }
};

export const exportUserData = async (req, res, next) => {
  try {
    const userData = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        settings: true,
        sessions: {
          include: { drowsinessEvents: true }
        },
        notifications: true,
        securityEvents: true
      }
    });

    const { passwordHash: _, twoFactorSecret: __, ...exportable } = userData;

    return successResponse(res, 'User data export generated.', exportable);
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id }
    });

    return successResponse(res, 'Account and all associated telemetry have been permanently deleted.');
  } catch (error) {
    next(error);
  }
};
